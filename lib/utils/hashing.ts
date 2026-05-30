import bcrypt from "bcryptjs";

export async function verifyHash(
  request: string,
  hashed: string
): Promise<boolean> {
  return await bcrypt.compare(request, hashed);
}

export async function hashing(request: string): Promise<string> {
  return await bcrypt.hash(request, 10);
}
