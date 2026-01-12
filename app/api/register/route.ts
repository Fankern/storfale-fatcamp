import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  username: z.string().min(3).max(24).transform((s) => s.trim().toLowerCase())
    .refine((s) => /^[a-z0-9_]+$/.test(s), "Brukernavn kan kun ha a-z, 0-9 og _"),
  displayName: z.string().min(1).max(40).transform((s) => s.trim()),
  password: z.string().min(6).max(100),
  goalWeight: z.number().positive().optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = Body.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map(i => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { displayName, password, goalWeight } = parsed.data;
const username = parsed.data.username.trim().toLowerCase();


  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return NextResponse.json({ error: "Brukernavn er tatt" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { username, displayName, passwordHash, goalWeight: goalWeight ?? null },
  });

  return NextResponse.json({ ok: true });
}
