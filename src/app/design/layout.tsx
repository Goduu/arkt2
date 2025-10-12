import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import CommandPalette from "./sidebar/CommandPalette";
import { UserDataProvider } from "@/components/yjs/UserDataContext";


export const metadata = {
  title: "ArkT-design",
  description: "Design multilevel system diagrams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserDataProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          {children}
          <CommandPalette />
        </SidebarInset>
      </SidebarProvider>
    </UserDataProvider>
  );
}
