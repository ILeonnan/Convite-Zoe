import { SignJWT, jwtVerify } from 'jose';

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'zoe1-aninho-fallback-secret-key-2025'
  );
}

export async function signJWT(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch (err) {
    return null;
  }
}
