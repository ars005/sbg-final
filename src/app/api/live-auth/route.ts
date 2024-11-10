import { auth } from "@/auth";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  const data = await auth();
  const email = data?.user?.email!;

  const session = liveblocks.prepareSession(email, {
    userInfo: {
      name: data?.user?.name!,
      email,
      avatar: data?.user?.image!,
    },
  });

  session.allow(`room100`, session.FULL_ACCESS);
  const { body, status } = await session.authorize();

  return new Response(body, { status });
}
