import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type UploadKind = "downloads" | "previews";

type StoredUpload = {
  contentType: string;
  filePath: string;
  url: string;
};

const maxUploadBytes = 10 * 1024 * 1024;
const maxImageSide = 4096;

const allowedUploadTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
  ["application/json", "json"],
]);

const extensionContentTypes = new Map(
  Array.from(allowedUploadTypes.entries()).map(([contentType, extension]) => [
    extension,
    contentType,
  ]),
);

function getUploadRoot() {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }

  return path.join(process.cwd(), "storage", "uploads");
}

function getUploadPublicBaseUrl() {
  return (process.env.UPLOAD_PUBLIC_BASE_URL ?? "/uploads").replace(/\/$/, "");
}

function readPngSize(buffer: Buffer) {
  if (
    buffer.length < 24 ||
    buffer.toString("ascii", 1, 4) !== "PNG" ||
    buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readJpegSize(buffer: Buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ]);

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const segmentLength = buffer.readUInt16BE(offset + 2);

    if (startOfFrameMarkers.has(marker)) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

function readUInt24LE(buffer: Buffer, offset: number) {
  return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);
}

function readWebpSize(buffer: Buffer) {
  if (
    buffer.length < 30 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);

  if (chunkType === "VP8X") {
    return {
      width: readUInt24LE(buffer, 24) + 1,
      height: readUInt24LE(buffer, 27) + 1,
    };
  }

  if (chunkType === "VP8L" && buffer.length >= 25) {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];

    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }

  if (
    chunkType === "VP8 " &&
    buffer.length >= 30 &&
    buffer[23] === 0x9d &&
    buffer[24] === 0x01 &&
    buffer[25] === 0x2a
  ) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  return null;
}

function readImageSize(buffer: Buffer, contentType: string) {
  if (contentType === "image/png") {
    return readPngSize(buffer);
  }

  if (contentType === "image/jpeg") {
    return readJpegSize(buffer);
  }

  if (contentType === "image/webp") {
    return readWebpSize(buffer);
  }

  return null;
}

function validateUploadBuffer(buffer: Buffer, contentType: string) {
  if (buffer.length > maxUploadBytes) {
    throw new Error("上传文件不能超过 10 MB。");
  }

  if (contentType.startsWith("image/")) {
    const size = readImageSize(buffer, contentType);

    if (!size) {
      throw new Error("无法校验图片尺寸。");
    }

    if (size.width > maxImageSide || size.height > maxImageSide) {
      throw new Error("图片尺寸不能超过 4096 x 4096。");
    }
  }
}

function resolveStoredUploadPath(relativePath: string[]) {
  const root = getUploadRoot();
  const filePath = path.resolve(root, ...relativePath);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    throw new Error("上传路径无效。");
  }

  return filePath;
}

export async function storeAdminUpload(file: File, kind: UploadKind) {
  if (file.size === 0) {
    return null;
  }

  const extension = allowedUploadTypes.get(file.type);

  if (!extension) {
    throw new Error("不支持的上传文件类型。");
  }

  if (kind === "previews" && !file.type.startsWith("image/")) {
    throw new Error("预览图只能上传图片。");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  validateUploadBuffer(buffer, file.type);

  const month = new Date().toISOString().slice(0, 7);
  const filename = `${randomUUID()}.${extension}`;
  const filePath = resolveStoredUploadPath([kind, month, filename]);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  return `${getUploadPublicBaseUrl()}/${kind}/${month}/${filename}`;
}

export async function readStoredUpload(relativePath: string[]) {
  const filePath = resolveStoredUploadPath(relativePath);
  const extension = path.extname(filePath).slice(1).toLowerCase();
  const contentType = extensionContentTypes.get(extension);

  if (!contentType) {
    return null;
  }

  const buffer = await readFile(filePath);

  return {
    contentType,
    filePath,
    url: `${getUploadPublicBaseUrl()}/${relativePath.join("/")}`,
    buffer,
  } satisfies StoredUpload & { buffer: Buffer };
}
