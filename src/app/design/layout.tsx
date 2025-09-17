import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import CommandPalette from "./sidebar/CommandPalette";


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
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {children}
        <CommandPalette />
      </SidebarInset>
    </SidebarProvider>
  );
}
