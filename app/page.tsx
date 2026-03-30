import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";
import { Header } from "@/components/Header";

export default async function Home() {
  const cookieStore = await cookies();

  if (!cookieStore.has("research_gpt_auth")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <ChatWindow />
    </div>
  );
}
