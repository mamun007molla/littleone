import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  console.log("LOGIN DEBUG");
  console.log("Request email:", email);
  console.log("Env email:", process.env.ADMIN_EMAIL);
  console.log(
    "Hash loaded:",
    !!process.env.ADMIN_PASSWORD_HASH,
    "Length:",
    process.env.ADMIN_PASSWORD_HASH?.length,
  );

  const emailMatch = email === process.env.ADMIN_EMAIL;

  const passwordMatch = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH || "",
  );

  console.log("Email match:", emailMatch);
  console.log("Password match:", passwordMatch);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  if (!emailMatch || !passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createAdminSession(email);

  return NextResponse.json({ ok: true });
}
