import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elon Musk INTJ Personality Profile | Stablecharacter",
  description: "Explore Elon Musk's INTJ personality type, traits, and characteristics. Chat with an AI version trained on his personality type.",
  openGraph: {
    title: "Elon Musk INTJ Personality Profile | Stablecharacter",
    description: "Explore Elon Musk's INTJ personality type, traits, and characteristics. Chat with an AI version trained on his personality type.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elon Musk INTJ Personality Profile | Stablecharacter",
    description: "Explore Elon Musk's INTJ personality type, traits, and characteristics. Chat with an AI version trained on his personality type.",
  }
};

export default function PersonalityProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}