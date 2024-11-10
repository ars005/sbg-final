"use client";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

function Home() {
  const { data } = useSession();
  if (data?.user) {
    redirect(`/game/?email=${encodeURIComponent(data.user.email!)}`);
  }

  return (
    <div>
      <button onClick={() => signIn("google")}>Signin</button>
    </div>
  );
}
export default Home;
