"use client";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface LoginProps {
  onLogin: (user: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, router]);

  async function handleClerkLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: username, password });
      if (result.status === "complete") {
        // Do not call setActive in a Client Component in Next.js App Router
        // Clerk will automatically set the session cookie on successful sign in
        onLogin(username, password);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-6 items-center bg-white/80 dark:bg-gray-900/90 shadow-2xl rounded-2xl p-10 w-full max-w-sm border border-gray-100 dark:border-gray-800 backdrop-blur"
      onSubmit={handleClerkLogin}
    >
      <div className="w-full flex flex-col items-center mb-2">
        <span className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200">
          Sign In
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          to your dashboard
        </p>
      </div>
      <input
        className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-gray-100 transition"
        placeholder="Username"
        value={username}
        autoComplete="username"
        onChange={e => setUsername(e.target.value)}
      />
      <div className="relative w-full">
        <input
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-gray-100 transition pr-10"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          autoComplete="current-password"
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute top-2 right-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none"
          tabIndex={-1}
          onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            // Eye icon (visible)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            // Crossed eye icon (hidden)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94l-11.88-11.88" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-xs w-full text-center">{error}</div>
      )}
      <button
        className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-900 dark:hover:to-blue-800 transition text-white px-4 py-2 rounded-lg w-full font-semibold shadow-lg mt-2 disabled:opacity-60"
        type="submit"
        disabled={loading || !isLoaded}
      >
        {loading ? "Signing in..." : "Log In"}
      </button>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 w-full text-center">
        Sign in with your Clerk credentials
      </div>
    </form>
  );
}
