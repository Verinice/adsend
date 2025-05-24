"use client";
import { Login } from "@/components/Login";
import { useState } from "react";
import { PropertyManager } from "@/components/PropertyManager";
import { useRouter } from "next/navigation";

// Entry point for the Next.js app
export default function HomePage() {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = (u: string, _p: string) => {
    setUser(u);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-center">
          {user ? <PropertyManager user={user} /> : <Login onLogin={handleLogin} />}
        </div>
      </div>
    </main>
  );
}
