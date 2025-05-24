"use client";
import { useState, useEffect } from "react";
import Properties from "@/components/Properties";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs';

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<string>("properties");
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Navbar overlays sidebar */}
      <nav className="fixed top-0 left-0 w-full z-30 h-16 flex items-center px-8 bg-blue-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 bg-green-200 dark:bg-gray-700 rounded-full">
            <svg
              className="w-6 h-6 text-green-700 dark:text-green-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a2 2 0 002 2h6a2 2 0 002-2v-6m-10 0h10"
              />
            </svg>
          </span>
          <span className="font-extrabold text-2xl tracking-tight font-sans text-green-700 dark:text-green-200" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '-0.02em' }}>
            AdSend
          </span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-blue-100 dark:border-gray-700">
            <span className="text-blue-700 dark:text-blue-200 font-semibold">
              {user?.username || user?.emailAddresses?.[0]?.emailAddress || user?.firstName || 'User'}
            </span>
          </div>
          <button
            className="p-2 rounded-full bg-transparent hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition focus:outline-none focus:ring-2 focus:ring-red-300"
            title="Logout"
            onClick={() => {
              // Use Clerk's signOut as a fire-and-forget, then force a hard reload
              try {
                signOut?.();
              } catch (e) {}
              setTimeout(() => {
                window.location.replace('/');
              }, 100);
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Sidebar (no scroll, content starts below navbar) */}
      <aside className="w-64 min-h-screen bg-blue-50 dark:bg-gray-800 flex flex-col pt-20 gap-4 fixed top-0 left-0 h-full z-20 overflow-hidden">
        <nav className="flex flex-col gap-1 text-green-800 dark:text-green-200 text-base font-semibold px-6">
          <a
            href="/dashboard"
            className={`flex items-center gap-3 px-2 py-1 rounded transition cursor-pointer group text-green-800 dark:text-green-200 font-medium
              ${
                typeof window !== "undefined" && window.location.pathname === "/dashboard"
                  ? "underline underline-offset-4 text-green-900 dark:text-green-100"
                  : "hover:underline hover:text-green-900 dark:hover:text-green-100 hover:bg-green-100/60 dark:hover:bg-gray-700/60 hover:shadow-sm hover:scale-[1.03]"
              }
            `}
            style={{ transition: 'box-shadow 0.15s, background 0.15s, transform 0.15s' }}
            aria-current={typeof window !== "undefined" && window.location.pathname === "/dashboard" ? "page" : undefined}
          >
            <svg
              className="w-5 h-5 text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
              />
            </svg>
            Dashboard
          </a>
          <a
            href="/users"
            className={`flex items-center gap-3 px-2 py-1 rounded transition cursor-pointer group text-green-800 dark:text-green-200 font-medium
              ${
                typeof window !== "undefined" && window.location.pathname === "/users"
                  ? "underline underline-offset-4 text-green-900 dark:text-green-100"
                  : "hover:underline hover:text-green-900 dark:hover:text-green-100 hover:bg-green-100/60 dark:hover:bg-gray-700/60 hover:shadow-sm hover:scale-[1.03]"
              }
            `}
            style={{ transition: 'box-shadow 0.15s, background 0.15s, transform 0.15s' }}
            aria-current={typeof window !== "undefined" && window.location.pathname === "/users" ? "page" : undefined}
          >
            <svg
              className="w-5 h-5 text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Users
          </a>
          <a
            href="/stats"
            className={`flex items-center gap-3 px-2 py-1 rounded transition cursor-pointer group text-green-800 dark:text-green-200 font-medium
              ${
                typeof window !== "undefined" && window.location.pathname === "/stats"
                  ? "underline underline-offset-4 text-green-900 dark:text-green-100"
                  : "hover:underline hover:text-green-900 dark:hover:text-green-100 hover:bg-green-100/60 dark:hover:bg-gray-700/60 hover:shadow-sm hover:scale-[1.03]"
              }
            `}
            style={{ transition: 'box-shadow 0.15s, background 0.15s, transform 0.15s' }}
            aria-current={typeof window !== "undefined" && window.location.pathname === "/stats" ? "page" : undefined}
          >
            <svg
              className="w-5 h-5 text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19V6m4 13V6m4 13v-7M7 19v-4M3 19v-2"
              />
            </svg>
            Stats
          </a>
        </nav>
        <div className="mt-auto text-xs text-green-500 dark:text-gray-400 pt-8 border-t border-green-100 dark:border-gray-700 px-6 pb-6">
          &copy; {new Date().getFullYear()} Ad Dashboard
        </div>
      </aside>
      {/* Main Section (content below navbar, beside sidebar) */}
      <main className="flex-1 flex flex-col min-h-screen ml-64 pt-[2rem]">
        <section className="flex-1 p-10 pb-24 bg-white dark:bg-gray-900">
          <div className="mx-auto">
            {activeSection === "properties" && <Properties />}
            {/* Add more sections here as you build them */}
          </div>
        </section>
      </main>
    </div>
  );
}
