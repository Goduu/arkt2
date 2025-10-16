'use client';

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import CommandPalette from "./sidebar/CommandPalette";
import { UserDataProvider } from "@/components/yjs/UserDataContext";
import { ReactNode, Suspense } from "react";
import LoadingPage from "./LoadingPage";


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense fallback={<LoadingPage />}>
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
