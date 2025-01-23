import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "16 Personalities Test | Coming Soon | Stablecharacter",
  description: "Our comprehensive 16 personalities test is coming soon. Discover your MBTI personality type and find characters that match your personality.",
  openGraph: {
    title: "16 Personalities Test | Coming Soon | Stablecharacter",
    description: "Our comprehensive 16 personalities test is coming soon. Discover your MBTI personality type and find characters that match your personality.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "16 Personalities Test | Coming Soon | Stablecharacter",
    description: "Our comprehensive 16 personalities test is coming soon. Discover your MBTI personality type and find characters that match your personality.",
  },
  keywords: [
    "16 personalities test",
    "MBTI test",
    "personality assessment",
    "Myers-Briggs",
    "personality type test",
    "MBTI personality test",
    "Jung personality test"
  ]
};

export default function SixteenPersonalitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}