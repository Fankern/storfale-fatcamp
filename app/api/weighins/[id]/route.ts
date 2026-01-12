import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchBody = z.object({
  date: z.string().optional(),     // "YYYY-MM-DD"
  weight: z.number().positive().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await ctx.params;

  const wi = await prisma.weighIn.findUnique({ where: { id } });
  if (!wi) return NextResponse.json({ error: "Fant ikke veiing" }, { status: 404 });
  if (wi.userId !== userId) return NextResponse.json({ error: "Ikke tillatt" }, { status: 403 });

  const parsed = PatchBody.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });

  const data: any = {};
  if (parsed.data.weight != null) data.weight = parsed.data.weight;
  if (parsed.data.date) data.date = new Date(parsed.data.date + "T12:00:00");

  await prisma.weighIn.update({ where: { id }, data });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await ctx.params;

  const wi = await prisma.weighIn.findUnique({ where: { id } });
  if (!wi) return NextResponse.json({ error: "Fant ikke veiing" }, { status: 404 });
  if (wi.userId !== userId) return NextResponse.json({ error: "Ikke tillatt" }, { status: 403 });

  await prisma.weighIn.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
