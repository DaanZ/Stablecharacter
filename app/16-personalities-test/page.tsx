'use client';

import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to MBTI Characters Chat
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-3">16 Personalities Test</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="bg-purple-500/10 p-4 rounded-full w-16 h-16 mx-auto">
            <Construction className="w-8 h-8 text-purple-500 mx-auto mt-1" />
          </div>
          <h2 className="text-2xl font-bold">Coming Soon</h2>
          <p className="text-muted-foreground">
            We're working hard to bring you an accurate and insightful 16 Personalities test. 
            In the meantime, try our Big Five personality assessment!
          </p>
          <div className="pt-4">
            <Link 
              href="/big-five-personality-test"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              Take Big Five Test
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Based on Carl Jung's personality theory and the Myers-Briggs Type Indicator (MBTI)
          </p>
        </div>
      </footer>
    </div>
  );
}