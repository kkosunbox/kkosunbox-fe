import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/features/auth/lib/session";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ hash: null });

  const secret = process.env.CHANNEL_TALK_SECRET_KEY;
  if (!secret) return NextResponse.json({ hash: null });

  const hash = createHmac("sha256", secret)
    .update(String(user.id))
    .digest("hex");

  return NextResponse.json({ hash });
}
