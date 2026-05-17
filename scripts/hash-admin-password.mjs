import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash-password -- <password>");
  process.exit(1);
}

const cost = 16384;
const blockSize = 8;
const parallelization = 1;
const salt = randomBytes(16).toString("hex");
const derivedKey = await scryptAsync(password, salt, 64, {
  N: cost,
  r: blockSize,
  p: parallelization,
});

console.log(
  ["scrypt", cost, blockSize, parallelization, salt, derivedKey.toString("hex")].join(
    ":",
  ),
);
