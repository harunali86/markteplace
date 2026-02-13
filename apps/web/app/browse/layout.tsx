import Link from "next/link";
import { Button } from "@doossh/ui";

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <div className="mr-4 flex">
                        <Link href="/" className="mr-6 flex items-center space-x-2">
                            <span className="font-bold sm:inline-block">Doossh</span>
                        </Link>
                        <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            <Link href="/browse" className="transition-colors hover:text-foreground text-foreground">Browse</Link>
                            <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link href="/onboarding">
                            <Button size="sm">For Vendors</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-6">
                {children}
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Doossh Inc. © 2026
                    </p>
                </div>
            </footer>
        </div>
    );
}
