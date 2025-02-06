export interface AssessmentQuestion {
  question: string;
  type: string; // MBTI category like EI, SN, TF, or JP
  math: "+" | "-";
}

export const assessment: AssessmentQuestion[] = [
  { question: "You often feel drained after spending time in a large group.", type: "EI", math: "-" },
  { question: "You feel more comfortable focusing on the present than on the future.", type: "SN", math: "+" },
  { question: "You make decisions based more on logic than emotions.", type: "TF", math: "+" },
  { question: "You enjoy vibrant social events with lots of people.", type: "EI", math: "+" },
  { question: "You often let your emotions guide your decisions.", type: "TF", math: "-" },
  { question: "You like to stick to routines and structured plans.", type: "JP", math: "+" },
  { question: "You are more of a natural improviser than a careful planner.", type: "JP", math: "-" },
  { question: "You strive to understand and support the emotions of those around you.", type: "TF", math: "-" },
  { question: "You enjoy having a to-do list and checking off tasks.", type: "JP", math: "+" },
  { question: "You feel energized by spending time with other people.", type: "EI", math: "+" },
  { question: "You consider yourself more intuitive than practical.", type: "SN", math: "-" },
  { question: "You prioritize reason over feelings when making decisions.", type: "TF", math: "+" },
  { question: "You feel more energized by spending time alone than with a group of people.", type: "EI", math: "-" },
  { question: "You find yourself more drawn to concrete facts than abstract theories.", type: "SN", math: "+" },
  { question: "You thrive in lively environments where you can connect with new people and exchange ideas.", type: "EI", math: "+" },
  { question: "You find it difficult to remain detached in emotionally charged situations.", type: "TF", math: "-" },
  { question: "You often start new hobbies before finishing old ones.", type: "JP", math: "-" },
  { question: "You rely more on your experience than your imagination.", type: "SN", math: "+" },
  { question: "You prefer to follow a set schedule rather than leave things to chance.", type: "JP", math: "+" },
  { question: "You analyze stories and experiences, seeking patterns and underlying principles.", type: "TF", math: "+" },
  { question: "You prefer exploring abstract concepts to focusing on specific details.", type: "SN", math: "-" },
  { question: "You find it difficult to introduce yourself to people.", type: "EI", math: "-" },
  { question: "You often spend time exploring unrealistic and impractical ideas.", type: "SN", math: "-" },
  { question: "You often rely on your instincts rather than detailed plans.", type: "JP", math: "-" },
];

export const traitDescriptions = {
  EI: {
    title: "Extraversion vs. Introversion",
    description:
      "Extraversion reflects a preference for social interaction, external stimulation, and action. Introversion reflects a preference for introspection, reflection, and solitary activities.",
  },
  SN: {
    title: "Sensing vs. Intuition",
    description:
      "Sensing reflects a preference for concrete, factual information and practical approaches. Intuition reflects a preference for abstract ideas, possibilities, and innovation.",
  },
  TF: {
    title: "Thinking vs. Feeling",
    description:
      "Thinking reflects a preference for logic and objective decision-making. Feeling reflects a preference for empathy, values, and considering how decisions affect others.",
  },
  JP: {
    title: "Judging vs. Perceiving",
    description:
      "Judging reflects a preference for structure, organization, and planned approaches. Perceiving reflects a preference for spontaneity, adaptability, and flexibility.",
  },
} as const;

export const answerOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
] as const;

export const helpText = `
Describe yourself as you honestly are, not as you want to be.
Answer based on your natural tendencies and preferences, thinking about how you act in most situations.
This will help you gain the most accurate understanding of your personality type.

Indicate for each statement how much you agree:
1. Strongly Disagree
2. Disagree
3. Neutral
4. Agree
5. Strongly Agree
`;
