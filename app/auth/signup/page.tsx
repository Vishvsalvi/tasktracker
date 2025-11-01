import { AuthForm } from "@/components/auth-form/authform"

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <a href="/" className="text-foreground text-3xl font-bold font-instrument-serif mb-2 font-mono">
            TaskTracker
          </a>
          <p className="text-muted-foreground text-sm">
            Create your account to get started.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  )
}