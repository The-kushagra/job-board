import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, Show } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex h-16 items-center px-4 md:px-6 border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 font-bold text-xl tracking-tighter" href="/">
          NextHire
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Pricing
          </Link>
          <Show when="signed-in">
            <Button asChild size="sm">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <SignOutButton>
              <Button variant="ghost" size="sm">Sign Out</Button>
            </SignOutButton>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </Show>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Find Your Next AI Job with Intelligence
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
                  The only job board powered by AI to match you with matching roles instantly.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="px-8">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">© 2025 NextHire. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
