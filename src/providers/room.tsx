"use client";

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";
import LiveBlocksProvider from "./live-blocks-provider";
import { LiveList } from "@liveblocks/client";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveBlocksProvider>
      <RoomProvider
        id="room100"
        initialPresence={{
          position: { x: 0, y: 0, z: 0 },
          health: 100,
          bullets: 50,
          hit: false,
        }}
        initialStorage={{ player: new LiveList([]) }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveBlocksProvider>
  );
}
