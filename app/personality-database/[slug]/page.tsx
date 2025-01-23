"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MessageSquare, Users2, ArrowLeft, X, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PremiumModal from "@/components/PremiumModal";

interface PersonalityData {
  id: string;
  name: string;
  mbti_type: string;
  occupation?: string;
  wiki_name: string;
  prompt: string;
}

interface WikiData {
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

interface Message {
  text: string;
  isUser: boolean;
}

// MBTI type definitions
const mbtiTypes = {
  INTJ: {
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
  },
  // Add other MBTI types as needed
};

export default function PersonalityProfile() {
  const params = useParams();
  const [personalityData, setPersonalityData] =
    useState<PersonalityData | null>(null);
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get personality data from Supabase
        const { data: personalityData, error: supabaseError } = await supabase
          .from("personalities")
          .select("*")
          .eq("name", params.slug)
          .single();

        if (supabaseError) throw supabaseError;
        if (!personalityData) throw new Error("Personality not found");

        setPersonalityData(personalityData);

        // Fetch Wikipedia data using wiki_name
        const wikiResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${personalityData.wiki_name}`
        );
        const wikiData = await wikiResponse.json();
        setWikiData(wikiData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.slug) {
      fetchData();
    }
  }, [params.slug, supabase]);

  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(!!user);

      // Check subscription status if user is logged in
      if (user?.email) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("email", user.email)
          .single();

        setIsSubscribed(!!subscription);
      }
    };

    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // If not logged in, show login modal after 5 messages
    if (!user && messages.length >= 2) {
      setShowSettings(true);
      return;
    }

    // Check counter and subscription for logged-in users
    if (user) {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (currentUser?.email) {
          // First check subscription status
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("email", currentUser.email)
            .single();

          // Only check counter if user is not subscribed
          if (!subscription) {
            const { data: counterData } = await supabase
              .from("chat_counter")
              .select("counter")
              .eq("email", currentUser.email)
              .single();

            // Show premium modal if counter is over 20 and no active subscription
            if (counterData?.counter >= 20) {
              setShowPremiumModal(true);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error checking counter and subscription:", error);
      }
    }

    const newMessage: Message = {
      text: inputValue.trim(),
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/py/personality_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          personalityType: personalityData?.mbti_type,
          prompt: personalityData?.prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiMessage = {
        text: data.message,
        isUser: false,
      };

      const updatedMessages = [...messages, newMessage, aiMessage];
      setMessages(updatedMessages);

      // Save chat and increment counter after both user message and AI response if user is logged in
      if (user) {
        try {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();
          if (currentUser?.email) {
            // Save chat
            await supabase.from("chats_personalities").insert({
              email: currentUser.email,
              messages: updatedMessages,
              character_id: params.slug,
              created_at: new Date().toISOString(),
            });

            // Check if user exists in chat_counter
            const { data: existingCounter } = await supabase
              .from("chat_counter")
              .select("*")
              .eq("email", currentUser.email)
              .single();

            if (existingCounter) {
              // Update existing counter
              await supabase
                .from("chat_counter")
                .update({
                  counter: existingCounter.counter + 1,
                  created_at: new Date().toISOString(),
                })
                .eq("email", currentUser.email);
            } else {
              // Create new counter entry
              await supabase.from("chat_counter").insert({
                email: currentUser.email,
                counter: 1,
                created_at: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error("Error saving chat and updating counter:", error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Store current chat state, URL, and chat window state in localStorage
    localStorage.setItem(
      "pendingPersonalityMessages",
      JSON.stringify(messages)
    );
    localStorage.setItem("pendingPersonalityInput", inputValue);
    localStorage.setItem("pendingPersonalityUrl", window.location.pathname);
    localStorage.setItem("pendingPersonalityChatOpen", "true"); // Store chat window state

    const redirectTo = window.location.href;

    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(!!user);

      // If user just signed in, check for pending chat state
      if (user) {
        const pendingMessages = localStorage.getItem(
          "pendingPersonalityMessages"
        );
        const pendingInput = localStorage.getItem("pendingPersonalityInput");
        const pendingUrl = localStorage.getItem("pendingPersonalityUrl");
        const pendingChatOpen = localStorage.getItem(
          "pendingPersonalityChatOpen"
        );

        // If there's a pending URL and it matches current page
        if (pendingUrl === window.location.pathname && pendingMessages) {
          const messages = JSON.parse(pendingMessages);
          setMessages(messages);
          if (pendingInput) setInputValue(pendingInput);
          if (pendingChatOpen) setIsChatOpen(true);

          // Save chat to Supabase
          try {
            // First check if chat already exists
            const { data: existingChat } = await supabase
              .from("chats_personalities")
              .select("*")
              .eq("email", user.email)
              .eq("character_id", params.slug)
              .single();

            if (existingChat) {
              // Update existing chat
              await supabase
                .from("chats_personalities")
                .update({
                  messages: messages,
                  created_at: new Date().toISOString(),
                })
                .eq("id", existingChat.id);
            } else {
              // Insert new chat
              await supabase.from("chats_personalities").insert({
                email: user.email,
                messages: messages,
                character_id: params.slug,
                created_at: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error("Error saving chat:", error);
          }

          // Clear localStorage
          localStorage.removeItem("pendingPersonalityMessages");
          localStorage.removeItem("pendingPersonalityInput");
          localStorage.removeItem("pendingPersonalityUrl");
          localStorage.removeItem("pendingPersonalityChatOpen");
        }
      }
    };

    getUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!personalityData || !wikiData) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        Personality not found
      </div>
    );
  }

  // Get MBTI type data with safety check
  const mbtiTypeData =
    mbtiTypes[
      personalityData.mbti_type.toUpperCase() as keyof typeof mbtiTypes
    ];

  // Add safety check for mbtiTypeData
  if (!mbtiTypeData) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        MBTI type data not found
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back to Database Link */}
          <Link
            href="/personality-database"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Database
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="w-32 h-32 relative rounded-xl overflow-hidden">
              <Image
                src={wikiData?.thumbnail?.source || "/placeholder-profile.jpg"}
                alt={personalityData?.name || "Profile"}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {personalityData?.wiki_name?.replace(/_/g, " ") ||
                    "Loading..."}
                </h1>
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium">
                  {personalityData?.mbti_type?.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-400 mb-4">
                {personalityData?.occupation}
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
                {mbtiTypeData.functions.map((func) => (
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
                    <span className="text-white font-medium">
                      {personalityData?.mbti_type?.toUpperCase()}
                    </span>{" "}
                    - {mbtiTypeData.description}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Common Traits</h2>
                <div className="grid grid-cols-2 gap-3">
                  {mbtiTypeData.traits.map((trait) => (
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
              <p className="text-gray-400">{wikiData.extract}</p>
              <div className="mt-4 text-sm text-gray-500">
                Source: Wikipedia
              </div>
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
                <h3 className="font-medium">
                  {personalityData?.wiki_name?.replace(/_/g, " ")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {personalityData?.mbti_type?.toUpperCase()}
                </p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      ? "bg-white text-black ml-4"
                      : "bg-white/10 text-white mr-4"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-white/10 text-white mr-4">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-4 bg-black"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-white rounded-lg w-12 h-10 p-0 hover:bg-white/90"
              >
                <Send className="h-4 w-4 text-black" />
              </Button>
            </div>
          </form>
        </div>
      )}

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in to continue chatting!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2"
            >
              <Image
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumModal
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
      />
    </div>
  );
}
