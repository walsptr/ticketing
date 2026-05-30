import { SignJWT, jwtVerify } from "jose";

type TokenPayload = {
  userId: string;
  deviceId: string;
};

export function createRefreshToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-{}[]";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getSecret() {
  // jose need Uint8Array
  return new TextEncoder().encode(process.env.JWT_SECRET as string);
}

export async function createAccessToken(
  userId: string,
  deviceId: string
): Promise<string> {
  return await new SignJWT({ userId, deviceId })
    .setProtectedHeader({ alg: "HS512" })
    .setExpirationTime("15m")
    .setIssuedAt(new Date())
    .sign(getSecret());
}

export async function decodeAccessToken(
  token: string
): Promise<(TokenPayload & { exp: number; iat: number }) | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS512"],
    });

    return payload as unknown as TokenPayload & { exp: number; iat: number };
  } catch (err) {
    console.log(err);
    return null;
  }
}
