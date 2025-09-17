import Dot from "@/components/ui/dot";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Dot>
      <div className="min-h-screen w-full flex flex-col items-center">
        {children}
      </div>
    </Dot>
  )
}