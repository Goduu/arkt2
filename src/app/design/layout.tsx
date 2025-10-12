'use client';

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import CommandPalette from "./sidebar/CommandPalette";
import { UserDataProvider } from "@/components/yjs/UserDataContext";
import { Suspense } from "react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserDataProvider>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            {children}
            <CommandPalette />
          </SidebarInset>
        </SidebarProvider>
      </UserDataProvider>
    </Suspense>
  );
}
