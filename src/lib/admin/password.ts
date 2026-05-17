import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const scryptKeyLength = 64;
const defaultScryptCost = 16384;
const defaultScryptBlockSize = 8;
const defaultScryptParallelization = 1;
const passwordHashVersion = "scrypt";

function splitPasswordHash(passwordHash: string) {
  const [version, cost, blockSize, parallelization, salt, hash] =
    passwordHash.split(":");

  if (
    version !== passwordHashVersion ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !salt ||
    !hash
  ) {
    return null;
  }

  return {
    cost: Number(cost),
    blockSize: Number(blockSize),
    parallelization: Number(parallelization),
    salt,
    hash,
  };
}

async function derivePasswordHash(
  password: string,
  salt: string,
  cost = defaultScryptCost,
  blockSize = defaultScryptBlockSize,
  parallelization = defaultScryptParallelization,
) {
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      scryptKeyLength,
      {
        N: cost,
        r: blockSize,
        p: parallelization,
      },
      (error, key) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(key);
      },
    );
  });

  return derivedKey.toString("hex");
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derivePasswordHash(password, salt);

  return [
    passwordHashVersion,
    defaultScryptCost,
    defaultScryptBlockSize,
    defaultScryptParallelization,
    salt,
    hash,
  ].join(":");
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string,
) {
  const parsedHash = splitPasswordHash(passwordHash);

  if (!parsedHash) {
    return false;
  }

  const expectedHash = Buffer.from(parsedHash.hash, "hex");
  const actualHash = Buffer.from(
    await derivePasswordHash(
      password,
      parsedHash.salt,
      parsedHash.cost,
      parsedHash.blockSize,
      parsedHash.parallelization,
    ),
    "hex",
  );

  if (expectedHash.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, actualHash);
}
