import { HeartPulse, Users, Brain, Sparkles } from "lucide-react";

export default function PremiumCharacters() {
  return (
    <section className="px-4 py-12 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 text-transparent bg-clip-text">
            Premium AI Characters
          </h2>
          <p className="text-muted-foreground text-lg">
            Experience human-like interactions with our most advanced AI
            personalities
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <HeartPulse className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Therapeutic Support
                </h3>
                <p className="text-muted-foreground">
                  Engage with empathetic AI therapists and counselors trained in
                  various therapeutic approaches
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Meaningful Friendships
                </h3>
                <p className="text-muted-foreground">
                  Build lasting connections with AI companions who remember your
                  conversations and grow with you
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Advanced Intelligence
                </h3>
                <p className="text-muted-foreground">
                  Experience multimodal interactions with AI that can understand
                  context, emotions, and nuanced communication
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
                <h3 className="font-semibold text-lg mb-2">
                  Immersive Roleplay
                </h3>
                <p className="text-muted-foreground">
                  Engage in dynamic scenarios with AI characters that adapt to
                  your interactions and story preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Experience the next generation of AI interaction
          </p>
        </div>
      </div>
    </section>
  );
}
