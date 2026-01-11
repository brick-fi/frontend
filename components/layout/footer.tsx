import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row max-w-screen-2xl px-4 md:px-8">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built for the RealFi Hackathon MVP.{" "}
                    <span className="font-semibold text-foreground">Not financial advice.</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="#" className="hover:underline hover:text-foreground">
                        Terms
                    </Link>
                    <Link href="#" className="hover:underline hover:text-foreground">
                        Privacy
                    </Link>
                </div>
            </div>
        </footer>
    )
}
