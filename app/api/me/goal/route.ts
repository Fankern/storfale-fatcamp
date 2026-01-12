import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  goalWeight: z.number().positive().nullable(), // null = fjern mål
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { goalWeight: parsed.data.goalWeight },
  });

  return NextResponse.json({ ok: true });
}
