"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageSquare, Users2, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";

// This could come from a shared MBTI type definition
const intjType = {
  name: "INTJ",
  description: "Introverted, Intuitive, Thinking, Judging",
  functions: [
    {
      name: "Introverted Intuition (Ni)",
      role: "Dominant",
      description:
        "Primary function that drives long-term vision and future-oriented thinking",
    },
    {
      name: "Extraverted Thinking (Te)",
      role: "Auxiliary",
      description:
        "Secondary function for logical decision-making and systematic planning",
    },
    {
      name: "Introverted Feeling (Fi)",
      role: "Tertiary",
      description: "Third function for personal values and moral judgments",
    },
    {
      name: "Extraverted Sensing (Se)",
      role: "Inferior",
      description:
        "Fourth function for experiencing and interacting with the immediate environment",
    },
  ],
  traits: [
    "Strategic planning",
    "Analytical thinking",
    "Independent",
    "Knowledge-seeking",
  ],
};

interface WikiData {
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  description?: string;
}

export default function PersonalityProfile() {
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function fetchWikiData() {
      try {
        const response = await fetch(
          "https://en.wikipedia.org/api/rest_v1/page/summary/Elon_Musk"
        );
        const data = await response.json();
        setWikiData(data);
      } catch (error) {
        console.error("Error fetching Wikipedia data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWikiData();
  }, []);

  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add scrollToBottom function
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add useEffect for scrolling
  useEffect(() => {
    // Scroll when messages change or when typing status changes
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle chat submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: inputValue, isUser: true }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    // Simulate a brief delay before AI response
    setTimeout(() => {
      setMessages([...newMessages, { text: "hi", isUser: false }]);
      setIsTyping(false);
    }, 1000); // 1 second delay to simulate typing
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/personality-database"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Database
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 relative rounded-xl overflow-hidden">
              <Image
                src={wikiData?.thumbnail?.source || "/placeholder-profile.jpg"}
                alt="Elon Musk"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Elon Musk</h1>
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium">
                  {intjType.name}
                </span>
              </div>

              <p className="text-gray-400 mb-4">
                Entrepreneur, CEO of Tesla and SpaceX
              </p>

              <div className="flex gap-4">
                <Button
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Users2 className="w-4 h-4 mr-2" />
                  View Similar Types
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main
        className={`py-12 transition-opacity duration-300 ${
          isChatOpen ? (isMobile ? "hidden" : "opacity-50") : "opacity-100"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Cognitive Functions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Cognitive Functions
              </h2>
              <div className="space-y-3">
                {intjType.functions.map((func) => (
                  <div
                    key={func.name}
                    className="p-4 rounded-lg border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{func.name}</span>
                      <span className="text-sm text-gray-400">{func.role}</span>
                    </div>
                    <p className="text-sm text-gray-400">{func.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Type Description and Common Traits */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Type Description</h2>
                <div className="p-4 rounded-lg border border-white/20">
                  <p className="text-gray-400">
                    <span className="text-white font-medium">INTJ</span> -
                    Introverted, Intuitive, Thinking, Judging
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Common Traits</h2>
                <div className="grid grid-cols-2 gap-3">
                  {intjType.traits.map((trait) => (
                    <div
                      key={trait}
                      className="p-3 rounded-lg border border-white/20"
                    >
                      <span className="text-sm">{trait}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Background */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Background</h2>
            <div className="rounded-lg border border-white/20 p-6">
              {isLoading ? (
                <div className="h-20 animate-pulse bg-white/5 rounded" />
              ) : (
                <>
                  <p className="text-gray-400">
                    {wikiData?.extract || "No information available"}
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    Source: Wikipedia
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Chat Interface */}
      {isChatOpen && (
        <div
          className={`
          bg-background flex flex-col
          ${
            isMobile
              ? "fixed inset-0 z-50" // Full screen on mobile
              : "fixed bottom-0 right-8 w-[400px] h-[600px] rounded-t-lg shadow-lg z-50"
          }
        `}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-black">
            <div className="flex items-center gap-2">
              <Image
                src={wikiData?.thumbnail?.source || "/placeholder-profile.jpg"}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div>
                <h3 className="font-medium">Elon Musk</h3>
                <p className="text-xs text-muted-foreground">INTJ</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}
              className={isMobile ? "absolute right-2 top-2" : ""}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div
            className={`
            flex-1 overflow-y-auto p-4 space-y-4
            ${isMobile ? "pb-safe" : ""} // Add padding for iPhone safe area
          `}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? "bg-primary text-primary-foreground ml-4"
                      : "bg-muted mr-4"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">typing...</p>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className={`
            p-4 border-t
            ${isMobile ? "pb-safe" : ""} // Add padding for iPhone safe area
          `}
          >
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
