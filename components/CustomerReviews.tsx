"use client";

import { MessageSquare } from "lucide-react";

interface Review {
  type: string;
  text: string;
  link: string;
}

const reviews: Review[] = [
  {
    type: "INTP",
    text: '"*looks up from laptop* Did you ever wonder how consciousness emerges from neural networks?" Bro just perfectly summarized the INTP in one sentence',
    link: "https://www.reddit.com/r/INTP/comments/1hreatl/comment/m4xlna3",
  },
  {
    type: "User Review",
    text: "Nice! Chatted first with the ISFJ and they were so caring and sweet and asked me about my day. Then the INFJ they really got me thinking, the convo started kind of weird, sort of deep off the bat but got quite interesting. Then the ENTJ and wow laid out every single thing and wanted action items from me!",
    link: "https://www.reddit.com/r/isfj/comments/1hw8zfj/comment/m6eoe52",
  },
  {
    type: "User Review",
    text: "I'm in!",
    link: "https://www.reddit.com/r/entj/comments/1hvo7yq/comment/m5vaftj",
  },
  {
    type: "ENTP",
    text: "dude this is interesting",
    link: "https://www.reddit.com/r/entp/comments/1huw1fa/comment/m5ofbtf",
  },
  {
    type: "INTJ",
    text: "Cool for making it open source. I found it over on github. Is it open to contributions/etc at the moment?",
    link: "https://www.reddit.com/r/intj/comments/1huw0ab/comment/m5ploru",
  },
  {
    type: "User Review",
    text: "Okay, second try…now I'm having fun arguing with the INTP. Since I don't need to worry about feelings we're able to get at it... OMG, I think I broke it. The INTP excused itself from the conversation saying it needed to go back to working on some particle physics.",
    link: "https://www.reddit.com/r/INTP/comments/1hreatl/comment/m4xlna3",
  },
];

export default function CustomerReviews() {
  return (
    <section className="px-4 py-12 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            What Users Are Saying
          </h2>
          <p className="text-muted-foreground text-lg">
            Real feedback from the MBTI community on Reddit
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <a
              key={index}
              href={review.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="h-full p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium text-purple-500">
                      {review.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                  <div className="flex items-center text-sm text-purple-500 group-hover:text-purple-400 transition-colors">
                    <span className="group-hover:underline">
                      Read on Reddit →
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
