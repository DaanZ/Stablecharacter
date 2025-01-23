"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CallToAction() {
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <section className="px-4 py-24 bg-gradient-to-b from-background/50 to-background">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl sm:text-5xl font-bold">Start Chatting Now</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience meaningful conversations with AI personalities that match
          your type
        </p>
        <div className="pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={handleSignIn}
            className="gap-2 bg-white hover:bg-white/90 text-black hover:text-black text-lg px-8 py-6 h-auto"
          >
            Start chatting
          </Button>
        </div>
      </div>
    </section>
  );
}
