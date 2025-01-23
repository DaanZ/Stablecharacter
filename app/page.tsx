"use client";

import Image from "next/image";
import Link from "next/link";
import {
  RefreshCcw,
  Settings,
  Send,
  Share2,
  Check,
  Menu,
  MessageSquareText,
  FileText,
  HeartPulse,
  Users,
  Brain,
  Sparkles,
  BarChart3,
  Users2,
  LineChart,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, FormEvent, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ChatList from "@/components/ChatList";
import PremiumModal from "@/components/PremiumModal";
import { Textarea } from "@/components/ui/textarea";
import { characterGroups } from "@/app/data/characterGroups";
import { useRouter } from "next/navigation";
import PersonalityTests from "@/components/PersonalityTests";
import PremiumCharacters from "@/components/PremiumCharacters";
import PersonalityDatabase from "@/components/PersonalityDatabase";
import CustomerReviews from "@/components/CustomerReviews";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
interface Message {
  text: string;
  isUser: boolean;
}

interface Character {
  name: string;
  occupation: string;
  avatar: string;
  first_message: string;
}

interface CharacterGroups {
  [key: string]: {
    title: string;
    characters: { [key: string]: Character };
  };
}

interface ChatData {
  email: string;
  messages: Message[];
  character_id: string;
  created_at?: string;
}

export default function MessagingInterface() {
  // First define the character groups

  // Then define the helper function
  const getRandomCharacter = () => {
    const allCharacters = Object.values(characterGroups).flatMap((group) =>
      Object.keys(group.characters)
    );
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    return allCharacters[randomIndex];
  };

  // Then use it in useState
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  );
  const [showCopied, setShowCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatListRefresh, setChatListRefresh] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showAuthorNote, setShowAuthorNote] = useState(false);
  const [authorNote, setAuthorNote] = useState("");
  const [showAnime, setShowAnime] = useState(false);
  const [shouldShowSidebar, setShouldShowSidebar] = useState(false);
  const router = useRouter();

  // Add messageEndRef
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Add scrollToBottom function
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add useEffect for scrolling
  useEffect(() => {
    // Only scroll if we have more than the initial message
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Check if there are any existing messages in localStorage
      const existingMessages = localStorage.getItem("pendingMessages");
      if (existingMessages) {
        const messages = JSON.parse(existingMessages);
        if (messages.length > 0) {
          setShouldShowSidebar(true);
        }
      }

      // Add visit log if user is logged in
      if (user?.email) {
        try {
          await supabase.from("logs").insert({
            email: user.email,
          });
        } catch (error) {
          console.error("Error logging visit:", error);
        }
      }

      // Restore author's note from localStorage
      const savedNote = localStorage.getItem("authorNote");
      if (savedNote) {
        setAuthorNote(savedNote);
      }

      // If user just signed in, restore messages and save to Supabase
      if (user) {
        const pendingMessages = localStorage.getItem("pendingMessages");
        const pendingInput = localStorage.getItem("pendingInput");
        const pendingCharacter = localStorage.getItem("pendingCharacter");
        const pendingNote = localStorage.getItem("authorNote");

        if (pendingMessages && pendingCharacter) {
          const messages = JSON.parse(pendingMessages);
          setMessages(messages);
          setSelectedCharacter(pendingCharacter);

          // Create the initial author's note object
          const currentTime = new Date().toISOString();
          const authorNoteObj = pendingNote
            ? { [currentTime]: pendingNote }
            : {};

          try {
            // First get the existing chat if it exists
            const { data: existingChat } = await supabase
              .from("chats")
              .select("*")
              .match({ email: user.email, character_id: pendingCharacter })
              .single();

            // If there was an existing chat, move it to deleted_chats
            if (existingChat) {
              await supabase.from("deleted_chats").insert({
                email: existingChat.email,
                messages: existingChat.messages,
                character_id: existingChat.character_id,
                created_at: existingChat.created_at,
                authors_note: existingChat.authors_note || {},
              });

              // Then delete the existing chat
              await supabase
                .from("chats")
                .delete()
                .match({ email: user.email, character_id: pendingCharacter });
            }

            // Insert the current chat state
            await supabase.from("chats").insert({
              email: user.email,
              messages: messages,
              character_id: pendingCharacter,
              authors_note: authorNoteObj,
            });

            // Trigger chat list refresh
            setChatListRefresh((prev) => prev + 1);

            // Clear localStorage
            localStorage.removeItem("pendingMessages");
            localStorage.removeItem("pendingCharacter");
          } catch (error) {
            console.error("Error handling chat update:", error);
          }
        }

        if (pendingInput) {
          setInputValue(pendingInput);
          localStorage.removeItem("pendingInput");
        }

        if (pendingCharacter) {
          // First check if there's an existing chat in the database
          const existingChat = await loadChat(
            supabase,
            user.email,
            pendingCharacter
          );
          setSelectedCharacter(pendingCharacter);

          if (existingChat) {
            // If chat exists in database, use that
            setMessages(existingChat.messages);
          } else {
            // Only set initial message if no existing chat
            const character = getCurrentCharacter(pendingCharacter);
            setMessages([
              { text: character?.first_message || "Hi", isUser: false },
            ]);
          }
        } else {
          const newCharacter = getRandomCharacter();
          setSelectedCharacter(newCharacter);
          const character = getCurrentCharacter(newCharacter);
          setMessages([
            { text: character?.first_message || "Hi", isUser: false },
          ]);
        }
      } else {
        // If no user is logged in, select a random character and use their first message
        const newCharacter = getRandomCharacter();
        setSelectedCharacter(newCharacter);
        const character = getCurrentCharacter(newCharacter);
        setMessages([
          { text: character?.first_message || "Hi", isUser: false },
        ]);
        setAuthorNote(""); // Clear the author's note
      }
    };
    getUser();
  }, []);

  // Helper function to get character group
  const getCharacterGroup = (charKey: string | null) => {
    if (!charKey) return "analysts";
    const type = charKey.substring(0, 4); // Get XXXX from XXXX_gender
    switch (type) {
      case "intj":
      case "intp":
      case "entj":
      case "entp":
        return "analysts";
      case "infj":
      case "infp":
      case "enfj":
      case "enfp":
        return "diplomats";
      case "istj":
      case "isfj":
      case "estj":
      case "esfj":
        return "sentinels";
      case "istp":
      case "isfp":
      case "estp":
      case "esfp":
        return "explorers";
      default:
        return "analysts";
    }
  };

  // Get current character
  const getCurrentCharacter = (charKey: string | null) => {
    if (!charKey) return null;
    const group = getCharacterGroup(charKey);
    return characterGroups[group].characters[charKey];
  };

  const saveChat = async (supabase: any, chatData: ChatData) => {
    // Don't save empty chats
    if (!chatData.messages || chatData.messages.length === 0) {
      return null;
    }

    // First check if chat exists
    const { data: existingChat, error: fetchError } = await supabase
      .from("chats")
      .select("*")
      .eq("email", chatData.email)
      .eq("character_id", chatData.character_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing chat:", fetchError);
      return null;
    }

    const currentTime = new Date().toISOString();
    const newAuthorNote = authorNote.trim()
      ? {
          [currentTime]: authorNote.trim(),
        }
      : {};

    if (existingChat) {
      // Merge existing author notes with new one if it exists
      const updatedAuthorNotes = {
        ...(existingChat.authors_note || {}),
        ...(authorNote.trim() ? newAuthorNote : {}),
      };

      // Update existing chat with new messages and author notes
      const { error: updateError } = await supabase
        .from("chats")
        .update({
          messages: chatData.messages,
          authors_note: updatedAuthorNotes,
        })
        .eq("id", existingChat.id);

      if (updateError) {
        console.error("Error updating chat:", updateError);
        return null;
      }

      setChatListRefresh((prev) => prev + 1);
      return {
        ...existingChat,
        messages: chatData.messages,
        authors_note: updatedAuthorNotes,
      };
    }

    // If no existing chat, insert the new one
    const { error: insertError } = await supabase.from("chats").insert({
      email: chatData.email,
      messages: chatData.messages,
      character_id: chatData.character_id,
      authors_note: newAuthorNote,
    });

    if (insertError) {
      console.error("Error inserting chat:", insertError);
      return null;
    }

    setChatListRefresh((prev) => prev + 1);
    return chatData;
  };

  const loadChat = async (
    supabase: any,
    email: string,
    character_id: string
  ) => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("email", email)
      .eq("character_id", character_id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading chat:", error);
      return null;
    }
    return data;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // If first message, show sidebar
    if (messages.length === 1) {
      // Only the initial AI message
      setShouldShowSidebar(true);
    }

    // If not logged in at all, show login modal after 10 messages
    if (!user && messages.length >= 10) {
      setShowSettings(true);
      return;
    }

    if (inputValue.trim()) {
      // If user is logged in, check their total message count
      if (user?.email && !isSubscribed) {
        try {
          const { data: userCounter } = await supabase
            .from("chat_counter")
            .select("counter")
            .eq("email", user.email)
            .single();

          // Show paywall if total messages exceed 20
          if (userCounter && userCounter.counter >= 15) {
            setShowPremiumModal(true);
            return;
          }
        } catch (error) {
          console.error("Error checking message counter:", error);
        }
      }

      // Rest of the message handling code...
      if (user?.email) {
        try {
          // First check if user exists
          const { data: existingUser } = await supabase
            .from("chat_counter")
            .select("counter")
            .eq("email", user.email)
            .single();

          if (existingUser) {
            // Update existing counter
            await supabase
              .from("chat_counter")
              .update({ counter: existingUser.counter + 1 })
              .eq("email", user.email);
          } else {
            // Insert new user with counter = 1
            await supabase
              .from("chat_counter")
              .insert({ email: user.email, counter: 1 });
          }
        } catch (error) {
          console.error("Error updating message counter:", error);
        }
      }

      const userMessage = { text: inputValue, isUser: true };
      setInputValue("");
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      const requestBody = {
        messages: [...messages, userMessage],
        selectedCharacter: selectedCharacter,
        authorNote: localStorage.getItem("authorNote") || "",
      };

      try {
        const response = await fetch("/api/py/message_response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setIsTyping(false);
        const newMessages = [
          ...messages,
          userMessage,
          { text: data.message, isUser: false },
        ];
        setMessages(newMessages);

        // Save chat if user is logged in
        if (user?.email && selectedCharacter) {
          await saveChat(supabase, {
            email: user.email,
            messages: newMessages,
            character_id: selectedCharacter,
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setIsTyping(false);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chat with MBTI Characters",
          text: "Check out this interesting chat with MBTI personalities!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const handleGoogleSignIn = () => {
    // Store current messages, input value, and selected character in localStorage
    localStorage.setItem("pendingMessages", JSON.stringify(messages));
    localStorage.setItem("pendingInput", inputValue);
    localStorage.setItem("pendingCharacter", selectedCharacter);

    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });
  };

  // Add new ref for input
  const inputRef = useRef<HTMLInputElement>(null);

  // Add useEffect for mobile input focus
  useEffect(() => {
    // First reset scroll position
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Then focus input with multiple attempts
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
        // Double-check scroll position after focus
        window.scrollTo(0, 0);
      }
    };

    // Try focusing multiple times to ensure it works
    const timeoutId1 = setTimeout(focusInput, 0);
    const timeoutId2 = setTimeout(focusInput, 100);
    const timeoutId3 = setTimeout(focusInput, 300);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [messages.length]);

  const handleCharacterChange = async (characterId: string) => {
    setSelectedCharacter(characterId);

    // If user is logged in, try to load existing chat
    if (user?.email) {
      const existingChat = await loadChat(supabase, user.email, characterId);
      if (existingChat) {
        setMessages(existingChat.messages);

        // Get the most recent author's note if it exists
        if (existingChat.authors_note) {
          const timestamps = Object.keys(existingChat.authors_note).sort();
          const mostRecentNote =
            timestamps.length > 0
              ? existingChat.authors_note[timestamps[timestamps.length - 1]]
              : "";
          setAuthorNote(mostRecentNote);
          localStorage.setItem("authorNote", mostRecentNote);
        } else {
          setAuthorNote("");
          localStorage.setItem("authorNote", "");
        }
      } else {
        // Reset messages if no existing chat and add initial message
        const character = getCurrentCharacter(characterId);
        setMessages([
          { text: character?.first_message || "Hi", isUser: false },
        ]);
        setAuthorNote("");
        localStorage.setItem("authorNote", "");
      }
    } else {
      // If no user is logged in, just show initial message
      const character = getCurrentCharacter(characterId);
      setMessages([{ text: character?.first_message || "Hi", isUser: false }]);
      setAuthorNote("");
      localStorage.setItem("authorNote", "");
    }
  };

  // Then use this for both manual selection and random selection
  const handleRandomCharacter = async () => {
    const newCharacter = getRandomCharacter();
    await handleCharacterChange(newCharacter);
  };

  const handleChatDelete = (deletedCharacterId: string) => {
    if (selectedCharacter === deletedCharacterId) {
      setMessages([]);
      setSelectedCharacter(getRandomCharacter());
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 640;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileView || isTouchDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkSubscription = async () => {
    if (!user?.email) return;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("email", user.email)
      .single();

    setIsSubscribed(!!subscription);
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  // Add this helper function
  const getFilteredCharacters = (characters: Record<string, Character>) => {
    return Object.entries(characters).reduce((acc, [id, character]) => {
      const isAnime = id.includes("_anime");
      if ((showAnime && isAnime) || (!showAnime && !isAnime)) {
        acc[id] = character;
      }
      return acc;
    }, {} as Record<string, Character>);
  };

  // Add new function to render landing content
  const renderLandingContent = () => {
    if (!user && !shouldShowSidebar) {
      return (
        <div className="flex flex-col min-h-[100dvh] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
          {/* Add logo and brand name at the top */}
          <div className="w-full px-4 py-4 relative">
            {/* Add glowing gradient overlay with reduced height */}
            <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-background to-transparent pointer-events-none blur-xl" />

            {/* Add a second, more focused gradient with reduced height */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Add container with flex justify-between */}
            <div className="relative z-10 flex justify-between items-center">
              {/* Logo and brand name */}
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Stablecharacter Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-medium tracking-tight text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Stablecharacter
                </span>
              </div>

              {/* Login button */}
              <Button
                variant="outline"
                onClick={async () => {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                  if (error) {
                    console.error("Error:", error.message);
                  }
                }}
                className="gap-2 bg-white hover:bg-white/90 text-black hover:text-black"
              >
                Sign in
              </Button>
            </div>
          </div>

          {/* Header section - reduced padding for mobile */}
          <div className="w-full max-w-3xl mx-auto text-center px-4 pt-6 pb-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Chat with MBTI Personalities
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore different personality types through meaningful
              conversations.
            </p>
          </div>

          {/* Chat Interface - adjusted height and padding */}
          <div className="w-full max-w-3xl mx-auto px-4 mb-8 flex-1">
            <div className="h-[calc(100vh-220px)] flex flex-col rounded-lg border shadow-lg">
              {/* Chat header */}
              <header className="flex items-center justify-between px-3 py-2 border-b sticky top-0 bg-background z-10">
                {selectedCharacter && (
                  <>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                      <Select
                        value={selectedCharacter}
                        onValueChange={handleCharacterChange}
                      >
                        <SelectTrigger className="w-[180px] sm:w-[200px] flex items-center gap-2">
                          {selectedCharacter && (
                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  getCurrentCharacter(selectedCharacter)
                                    ?.avatar || ""
                                }
                                alt={
                                  getCurrentCharacter(selectedCharacter)
                                    ?.name || ""
                                }
                                width={24}
                                height={24}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <SelectValue>
                            {selectedCharacter && (
                              <span className="truncate text-sm sm:text-base">
                                {getCurrentCharacter(selectedCharacter)?.name} (
                                {selectedCharacter.split("_")[0].toUpperCase()})
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b border-gray-200/10">
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-sm text-gray-400 font-medium">
                                {showAnime ? "Anime" : "Regular"}
                              </span>
                              <div
                                onClick={() => setShowAnime(!showAnime)}
                                className={`
                                  relative inline-flex h-7 w-12 cursor-pointer rounded-full 
                                  transition-colors duration-200 ease-in-out
                                  ${
                                    showAnime
                                      ? "bg-purple-600/25"
                                      : "bg-gray-700"
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    absolute top-1 left-1 inline-block h-5 w-5 
                                    transform rounded-full bg-white shadow-lg 
                                    transition-transform duration-200 ease-in-out
                                    ${
                                      showAnime
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                    }
                                    ${
                                      showAnime
                                        ? "bg-purple-500"
                                        : "bg-gray-200"
                                    }
                                  `}
                                />
                              </div>
                            </div>
                          </div>
                          {Object.entries(characterGroups).map(
                            ([groupKey, group]) => (
                              <SelectGroup key={groupKey}>
                                <SelectLabel>{group.title}</SelectLabel>
                                {Object.entries(
                                  getFilteredCharacters(group.characters)
                                ).map(([charKey, char]) => (
                                  <SelectItem key={charKey} value={charKey}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                          src={char.avatar}
                                          alt={char.name}
                                          width={32}
                                          height={32}
                                          className="object-cover"
                                        />
                                      </div>
                                      <span>
                                        {char.name} (
                                        {charKey.split("_")[0].toUpperCase()})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {(user || shouldShowSidebar) && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAuthorNote(!showAuthorNote)}
                        >
                          <FileText className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowShareDialog(true)}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSettings(true)}
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </header>

              {/* Chat messages */}
              <main className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 mb-4 ${
                          message.isUser ? "ml-auto flex-row-reverse" : ""
                        } max-w-[85%]`}
                      >
                        {!message.isUser && selectedCharacter && (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                getCurrentCharacter(selectedCharacter)
                                  ?.avatar || ""
                              }
                              alt={
                                getCurrentCharacter(selectedCharacter)?.name ||
                                "AI"
                              }
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            message.isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-start gap-2 mb-4 max-w-[85%]">
                        <Image
                          src={
                            getCurrentCharacter(selectedCharacter).avatar ||
                            "/placeholder.svg"
                          }
                          alt="AI"
                          width={32}
                          height={32}
                          className="rounded-full mt-1"
                        />
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messageEndRef} />
                  </div>
                </div>
              </main>

              {/* Chat input */}
              <footer className="sticky bottom-0 bg-background border-t">
                <form onSubmit={handleSubmit} className="p-2 sm:p-4">
                  <div className="flex items-center gap-2">
                    {user && !isSubscribed && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-auto sm:h-12 px-3 sm:px-4 shrink-0 bg-gradient-to-r from-purple-500/10 to-purple-400/20 hover:from-purple-500/20 hover:to-purple-400/30 border-purple-500/50 hover:border-purple-400 transition-all duration-300"
                        onClick={() => setShowPremiumModal(true)}
                      >
                        <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-purple-400 text-transparent bg-clip-text">
                          Pro
                        </span>
                      </Button>
                    )}
                    <Input
                      ref={inputRef}
                      placeholder="Type your message..."
                      className="bg-muted h-10 sm:h-12 text-sm sm:text-base min-w-0"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-10 w-10 sm:h-12 sm:w-12 shrink-0"
                      onClick={(e) => {
                        if (!user && messages.length >= 10) {
                          e.preventDefault();
                          setShowSettings(true);
                          return;
                        }
                        if (user && messages.length >= 15 && !isSubscribed) {
                          e.preventDefault();
                          setShowPremiumModal(true);
                          return;
                        }
                      }}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </form>
              </footer>
            </div>
          </div>

          {/* Features Section - hidden initially on mobile, shown after scroll */}
          <PremiumCharacters />

          {/* Personality Tests Section */}
          <PersonalityTests />

          {/* Personality Database Section */}
          <PersonalityDatabase />

          {/* Customer Reviews Section */}
          <CustomerReviews />

          {/* Call to Action Section */}
          <CallToAction />

          {/* Footer Section */}
          <Footer />
        </div>
      );
    }

    // Return the existing chat interface for logged-in users or after first message
    return (
      <div className="flex h-[100dvh] bg-background max-w-[100vw] overflow-hidden">
        {(user || shouldShowSidebar) &&
          ((showChatList && isMobile) || !isMobile) && (
            <div
              className={`${
                isMobile ? "fixed inset-0 z-50 bg-background" : ""
              }`}
            >
              <ChatList
                supabase={supabase}
                userEmail={user?.email}
                characterGroups={characterGroups}
                onChatSelect={(character) => {
                  if (character) {
                    handleCharacterChange(character);
                    setSelectedCharacter(character);
                    setShowChatList(false);
                  }
                }}
                selectedCharacter={selectedCharacter}
                refreshTrigger={chatListRefresh}
                onChatDelete={handleChatDelete}
                onClose={() => setShowChatList(false)}
                currentMessages={messages}
              />
            </div>
          )}

        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="h-full flex flex-col">
              <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b">
                {selectedCharacter && (
                  <>
                    {/* Mobile chat list button */}
                    {user && isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowChatList(true)}
                      >
                        <MessageSquareText className="h-5 w-5" />
                      </Button>
                    )}

                    {/* Random character button - show on desktop or when not logged in */}
                    {(!user || !isMobile) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          setMessages([]);
                          const newCharacter = getRandomCharacter();
                          await handleCharacterChange(newCharacter);
                        }}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
                      <Select
                        value={selectedCharacter}
                        onValueChange={handleCharacterChange}
                      >
                        <SelectTrigger className="w-[180px] sm:w-[200px] flex items-center gap-2">
                          {selectedCharacter && (
                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  getCurrentCharacter(selectedCharacter)
                                    ?.avatar || ""
                                }
                                alt={
                                  getCurrentCharacter(selectedCharacter)
                                    ?.name || ""
                                }
                                width={24}
                                height={24}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <SelectValue>
                            {selectedCharacter && (
                              <span className="truncate text-sm sm:text-base">
                                {getCurrentCharacter(selectedCharacter)?.name} (
                                {selectedCharacter.split("_")[0].toUpperCase()})
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b border-gray-200/10">
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-sm text-gray-400 font-medium">
                                {showAnime ? "Anime" : "Regular"}
                              </span>
                              <div
                                onClick={() => setShowAnime(!showAnime)}
                                className={`
                                  relative inline-flex h-7 w-12 cursor-pointer rounded-full 
                                  transition-colors duration-200 ease-in-out
                                  ${
                                    showAnime
                                      ? "bg-purple-600/25"
                                      : "bg-gray-700"
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    absolute top-1 left-1 inline-block h-5 w-5 
                                    transform rounded-full bg-white shadow-lg 
                                    transition-transform duration-200 ease-in-out
                                    ${
                                      showAnime
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                    }
                                    ${
                                      showAnime
                                        ? "bg-purple-500"
                                        : "bg-gray-200"
                                    }
                                  `}
                                />
                              </div>
                            </div>
                          </div>
                          {Object.entries(characterGroups).map(
                            ([groupKey, group]) => (
                              <SelectGroup key={groupKey}>
                                <SelectLabel>{group.title}</SelectLabel>
                                {Object.entries(
                                  getFilteredCharacters(group.characters)
                                ).map(([charKey, char]) => (
                                  <SelectItem key={charKey} value={charKey}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                          src={char.avatar}
                                          alt={char.name}
                                          width={32}
                                          height={32}
                                          className="object-cover"
                                        />
                                      </div>
                                      <span>
                                        {char.name} (
                                        {charKey.split("_")[0].toUpperCase()})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setShowAuthorNote(true)}
                      >
                        <FileText className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 relative"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setShowCopied(true);
                          setTimeout(() => setShowCopied(false), 2000);
                        }}
                      >
                        {showCopied ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Share2 className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </header>

              <main className="flex-1 overflow-y-auto p-2 sm:p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 mb-4 ${
                          message.isUser ? "ml-auto flex-row-reverse" : ""
                        } max-w-[85%]`}
                      >
                        {!message.isUser && selectedCharacter && (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                getCurrentCharacter(selectedCharacter)
                                  ?.avatar || ""
                              }
                              alt={
                                getCurrentCharacter(selectedCharacter)?.name ||
                                "AI"
                              }
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            message.isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-start gap-2 mb-4 max-w-[85%]">
                        <Image
                          src={
                            getCurrentCharacter(selectedCharacter).avatar ||
                            "/placeholder.svg"
                          }
                          alt="AI"
                          width={32}
                          height={32}
                          className="rounded-full mt-1"
                        />
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messageEndRef} />
                  </div>
                </div>
              </main>

              <footer className="border-t">
                <form onSubmit={handleSubmit} className="p-2 sm:p-4">
                  <div className="flex items-center gap-2">
                    {user && !isSubscribed && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-auto sm:h-12 px-3 sm:px-4 shrink-0 bg-gradient-to-r from-purple-500/10 to-purple-400/20 hover:from-purple-500/20 hover:to-purple-400/30 border-purple-500/50 hover:border-purple-400 transition-all duration-300"
                        onClick={() => setShowPremiumModal(true)}
                      >
                        <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-purple-400 text-transparent bg-clip-text">
                          Pro
                        </span>
                      </Button>
                    )}
                    <Input
                      ref={inputRef}
                      placeholder="Type your message..."
                      className="bg-muted h-10 sm:h-12 text-sm sm:text-base min-w-0"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-10 w-10 sm:h-12 sm:w-12 shrink-0"
                      onClick={(e) => {
                        if (!user && messages.length >= 10) {
                          e.preventDefault();
                          setShowSettings(true);
                          return;
                        }
                        if (user && messages.length >= 15 && !isSubscribed) {
                          e.preventDefault();
                          setShowPremiumModal(true);
                          return;
                        }
                      }}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </form>
              </footer>
            </div>
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {user ? "Settings" : "Sign in to see your chats!"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        user?.user_metadata?.avatar_url || "/placeholder.svg"
                      }
                      alt={user?.user_metadata?.full_name || "Profile"}
                      width={40}
                      height={40}
                      className="rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div>
                      <p className="font-medium">
                        {user.user_metadata?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      window.open("https://discord.gg/mrSkBn9F", "_blank")
                    }
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 127.14 96.36"
                    >
                      <path
                        d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                        fill="#5865f2"
                      />
                    </svg>
                    Join our Discord
                  </Button>

                  {isSubscribed && (
                    <Button
                      onClick={() => {
                        window.open(
                          "https://billing.stripe.com/p/login/7sI3dG56y8Wb8OQ3cc"
                        );
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Manage Subscription
                    </Button>
                  )}

                  <Button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setUser(null);
                      setShowSettings(false);
                      window.location.reload(); // Force reload to clear all states
                    }}
                    variant="outline"
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
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
              )}
            </div>
          </DialogContent>
        </Dialog>

        <PremiumModal
          open={showPremiumModal}
          onOpenChange={setShowPremiumModal}
        />

        <Dialog open={showAuthorNote} onOpenChange={setShowAuthorNote}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Author's Note</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Textarea
                placeholder="Add context or specific instructions for the character..."
                value={authorNote}
                onChange={(e) => setAuthorNote(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={async () => {
                  localStorage.setItem("authorNote", authorNote);
                  if (user?.email && selectedCharacter) {
                    // Save to database if user is logged in
                    await saveChat(supabase, {
                      email: user.email,
                      messages: messages,
                      character_id: selectedCharacter,
                    });
                  }
                  setShowAuthorNote(false);
                }}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  useEffect(() => {
    // Reset scroll position
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // For Safari

    // Temporarily fix position to ensure top loading
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    // Remove the fixed position after a tiny delay to allow scrolling
    setTimeout(() => {
      document.body.style.position = "";
      document.body.style.width = "";
    }, 10);

    return () => {
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  return renderLandingContent();
}
