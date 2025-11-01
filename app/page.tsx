import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HomePageContent } from "@/components/home-page-content";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return <HomePageContent />;
}
