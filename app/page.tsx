"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const admin = getAdminSession();

    if (!admin) {
      router.push("/login");
      return;
    }

    if (admin.status !== "active") {
      router.push("/unauthorized");
      return;
    }

    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <p className="text-slate-400">Redirecting...</p>
      </div>
    </div>
  );
}

