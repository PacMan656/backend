import bcrypt from 'bcrypt';

const ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export async function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
