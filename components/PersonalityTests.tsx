import Link from "next/link";
import { Brain, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonalityTests() {
  return (
    <section className="px-4 py-12 bg-gradient-to-b from-background/50 to-background">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Free Personality Tests
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover yourself through free assessments
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {/* Big Five Test */}
          <div className="group relative overflow-hidden rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-xl">Big Five Test</h3>
                  <p className="text-muted-foreground">
                    Measure your Openness, Conscientiousness, Extraversion,
                    Agreeableness, and Neuroticism
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  Scientific
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  5 min
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  Free
                </span>
              </div>
              <Link href="/big-five-personality-test" className="block">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  Take Test
                </Button>
              </Link>
            </div>
          </div>

          {/* 16 Personalities Test */}
          <div className="group relative overflow-hidden rounded-xl border bg-card hover:bg-card/80 transition-colors">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-xl">16 Personalities</h3>
                  <p className="text-muted-foreground">
                    Discover your MBTI type based on Carl Jung's personality
                    theory
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  MBTI Based
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  12 min
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                  Free
                </span>
              </div>
              <Link href="/16-personalities-test" className="block">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  Take Test
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-2">
            <Clock className="w-6 h-6 mx-auto text-muted-foreground" />
            <h4 className="font-medium">Quick & Easy</h4>
            <p className="text-sm text-muted-foreground">
              Complete your assessment in minutes
            </p>
          </div>
          <div className="text-center space-y-2">
            <Brain className="w-6 h-6 mx-auto text-muted-foreground" />
            <h4 className="font-medium">Scientific Approach</h4>
            <p className="text-sm text-muted-foreground">
              Based on established psychological theories
            </p>
          </div>
          <div className="text-center space-y-2">
            <Shield className="w-6 h-6 mx-auto text-muted-foreground" />
            <h4 className="font-medium">Private & Secure</h4>
            <p className="text-sm text-muted-foreground">
              Your results are completely confidential
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
