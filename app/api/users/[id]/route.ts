import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const myId = (session?.user as any)?.id as string | undefined;
  const myUsername = (session?.user as any)?.username as string | undefined;

  if (!myId) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const adminUsername = process.env.ADMIN_USERNAME;
  const isAdmin = !!adminUsername && myUsername === adminUsername;

  // Kun deg selv, eller admin kan slette andre
  if (!isAdmin && id !== myId) {
    return NextResponse.json({ error: "Ikke tillatt" }, { status: 403 });
  }

  // Sikkerhet: hvis du vil, kan du hindre admin i å slette seg selv:
  // if (isAdmin && id === myId) return NextResponse.json({ error: "Admin kan ikke slette seg selv" }, { status: 400 });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
