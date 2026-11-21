// src/routes/api.attendance.$sessionToken.qr.ts
import { prisma } from "@/generated/prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function GET({ params }: { params: { sessionToken: string } }) {
  // Ensure the request is authenticated
  const { userId } = auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { token: params.sessionToken },
    select: { qrSecret: true, qrTtlSeconds: true },
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify({ qrSecret: session.qrSecret, ttl: session.qrTtlSeconds }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
