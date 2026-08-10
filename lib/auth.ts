import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-change-me');
export async function createAdminSession(email: string) {
  const token = await new SignJWT({ email, role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
  (await cookies()).set('loo_admin', token, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*24*7 });
}
export async function isAdmin() {
  const token = (await cookies()).get('loo_admin')?.value;
  if (!token) return false;
  try { const { payload } = await jwtVerify(token, secret); return payload.role === 'admin'; } catch { return false; }
}
export async function clearAdminSession() { (await cookies()).delete('loo_admin'); }
