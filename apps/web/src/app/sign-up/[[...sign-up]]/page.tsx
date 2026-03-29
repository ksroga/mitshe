import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { SelfhostedSignUp } from "@/components/auth";

// Determine auth mode
const authMode =
  process.env.AUTH_MODE || process.env.NEXT_PUBLIC_AUTH_MODE || "clerk";

export default function SignUpPage() {
  // In local mode, redirect to dashboard (no auth needed)
  if (authMode === "local") {
    redirect("/dashboard");
  }

  // In selfhosted mode, show custom sign-up form
  if (authMode === "selfhosted") {
    return <SelfhostedSignUp />;
  }

  // In Clerk mode, show Clerk sign-up
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
