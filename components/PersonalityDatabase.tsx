import { BookOpen, Users2, Star, Sparkles } from "lucide-react";

export default function PersonalityDatabase() {
  return (
    <section className="px-4 py-12 bg-gradient-to-b from-background/50 to-background">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Personality Database
          </h2>
          <p className="text-muted-foreground text-lg">
            Chat with famous personalities and characters, each with their
            authentic MBTI type
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Historical Figures
                </h3>
                <p className="text-muted-foreground">
                  Engage with great minds from history - from philosophers to
                  scientists, each with their documented personality type
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Fictional Characters
                </h3>
                <p className="text-muted-foreground">
                  Chat with your favorite characters from movies, books, and
                  shows, accurately portrayed with their MBTI types
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users2 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Personality Matches
                </h3>
                <p className="text-muted-foreground">
                  Find and chat with characters that match your personality type
                  for deeper connections
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Type Exploration</h3>
                <p className="text-muted-foreground">
                  Learn about different personality types through authentic
                  interactions with well-known personalities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Characters */}
        <div className="mt-12">
          <h3 className="text-center text-lg font-semibold mb-6">
            Featured Personalities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <p className="font-medium">Sherlock Holmes</p>
              <span className="text-sm text-muted-foreground">INTJ</span>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="font-medium">Tony Stark</p>
              <span className="text-sm text-muted-foreground">ENTP</span>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="font-medium">Jane Austen</p>
              <span className="text-sm text-muted-foreground">INTJ</span>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="font-medium">Steve Jobs</p>
              <span className="text-sm text-muted-foreground">ENTJ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
