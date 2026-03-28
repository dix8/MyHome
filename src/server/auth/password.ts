import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const HASH_PREFIX = "scrypt";

export function hashPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, {
    cost: COST,
    blockSize: BLOCK_SIZE,
    parallelization: PARALLELIZATION,
  });

  return `${HASH_PREFIX}$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt}$${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [prefix, cost, blockSize, parallelization, salt, key] = passwordHash.split("$");

  if (
    prefix !== HASH_PREFIX ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !salt ||
    !key
  ) {
    return false;
  }

  const expectedKey = Buffer.from(key, "hex");
  const actualKey = scryptSync(password, salt, expectedKey.length, {
    cost: Number(cost),
    blockSize: Number(blockSize),
    parallelization: Number(parallelization),
  });

  if (expectedKey.length !== actualKey.length) {
    return false;
  }

  return timingSafeEqual(expectedKey, actualKey);
}
