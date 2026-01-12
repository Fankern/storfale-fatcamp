import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  date: z.string(), // "YYYY-MM-DD"
  weight: z.number().positive(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });

  const { date, weight } = parsed.data;

  await prisma.weighIn.create({
    data: {
      userId,
      weight,
      date: new Date(date + "T12:00:00"), // stabilt midt på dagen
    },
  });

  return NextResponse.json({ ok: true });
}
