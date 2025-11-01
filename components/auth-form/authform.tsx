"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { signUp, signIn } from "@/lib/actions/auth-actions";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthFormProps extends React.ComponentProps<"form"> {
  mode?: "signin" | "signup";
}

export function AuthForm({
  className,
  mode = "signin",
  ...props
}: AuthFormProps) {

  const router = useRouter();
  const isSignup = mode === "signup";
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        if(isSignup) {
            if(password !== confirmPassword) {
                toast.error("Passwords do not match")
                return;
            }
            if(!name.trim() || !email.trim() || !password.trim()) { 
                toast.error("Please fill in all fields")
                return;
            }
            setIsLoading(true);
            //TODO Check if email is already in use
            const result = await signUp(email, password, name);
            if(!result.user) {
                toast.error("Failed to create account")
                return;
            }
            toast.success("Account created successfully")
            router.push("/");
            return;
        } else {
            if(!email.trim() || !password.trim()) {
                toast.error("Please fill in all fields")
                return;
            }
            setIsLoading(true);
            const result = await signIn(email, password);
            if(!result.user) {
                toast.error("Invalid credentials")
            }
            toast.success("Logged in successfully")
            router.push("/");
            return;
        }
    } catch (error) {
        toast.error("An error occurred")
        console.error(error);
        return;
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <h1 className="text-2xl font-bold text-foreground">
          {isSignup ? "Create an account" : "Login to your account"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {isSignup
            ? "Enter your information to create your account"
            : "Enter your email below to login to your account"}
        </p>
      </div>

      <div className="flex flex-col gap-5 text-foreground">
        {isSignup && (
          <Field className="mt-2">
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        )}

        <Field className="mt-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field className="mt-2">
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            {!isSignup && (
              <a
                href="#"
                className="ml-auto text-xs text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            )}
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        {isSignup && (
          <Field className="my-2">
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
        )}

       
      </div>
      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : (isSignup ? "Create Account" : "Login")}
        </Button>
      <FieldSeparator>Or continue with</FieldSeparator>

      <div className="text-center text-sm text-muted-foreground mt-2">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
