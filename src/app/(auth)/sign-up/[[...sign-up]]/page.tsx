import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkActive = clerkKey && !clerkKey.includes("placeholder");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-6">
          <BrandLogo size="md" showTagline />
        </Link>

        {isClerkActive ? (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            appearance={clerkAppearance}
          />
        ) : (
          <div className="w-full p-6 bg-card border rounded-2xl shadow-lg text-center space-y-4">
            <h2 className="text-lg font-bold">Sign Up (Demo Mode)</h2>
            <p className="text-xs text-muted-foreground">
              Clerk authentication keys are not set yet. You can proceed directly to onboarding in demo mode.
            </p>
            <Link href="/onboarding" className="block">
              <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
