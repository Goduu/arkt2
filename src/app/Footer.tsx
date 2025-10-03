import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative container mt-12 md:mt-16 text-center mb-2">
            <div className="flex justify-center gap-4 my-6">
                <Link href="/">
                    <p className="opacity-80">Home</p>
                </Link>
                <Link href="/features">
                    <p className="opacity-80">Features</p>
                </Link>
                <Link href="/design">
                    <p className="opacity-80">Design</p>
                </Link>
            </div>
            <p className="text-sm opacity-80">
                <span className="font-semibold">ArkT</span> is a project by <a href="https://github.com/goduu" target="_blank" rel="noreferrer" className="underline">Goduu</a>.
            </p>
        </footer>
    )
}