"use server";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function signUp(email: string, password: string, name: string) {

    //* Check if email is already in use
    
   const result = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      callbackURL: "/",
    },
    headers: await headers(),
   })
   return result;
}

export async function signIn(email: string, password: string) {
   const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/",
    },
    headers: await headers(),
   })
   return result;
}

export async function signOut() {
   const result = await auth.api.signOut({ headers: await headers() })
   return result;
}