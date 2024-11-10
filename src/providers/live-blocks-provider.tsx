import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";

export default function LiveBlocksProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LiveblocksProvider throttle={16} authEndpoint={"/api/live-auth"}>
      {children}
    </LiveblocksProvider>
  );
}
