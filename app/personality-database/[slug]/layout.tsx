import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Format the name for display (e.g., "elon-musk" -> "Elon Musk")
  const name = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${name} MBTI Personality Profile | Stablecharacter`,
    description: `Explore ${name}'s personality type, traits, and characteristics. Chat with an AI version trained on their personality type.`,
    openGraph: {
      title: `${name} MBTI Personality Profile | Stablecharacter`,
      description: `Explore ${name}'s personality type, traits, and characteristics. Chat with an AI version trained on their personality type.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} MBTI Personality Profile | Stablecharacter`,
      description: `Explore ${name}'s personality type, traits, and characteristics. Chat with an AI version trained on their personality type.`,
    },
  };
}

export default function PersonalityProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
