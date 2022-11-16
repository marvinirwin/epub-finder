import React from "react";
import { Story } from "@storybook/react";
import { RevealedQuizCard, RevealedQuizCardProps } from "./revealed-quiz-card.component";

export default {
  title: "RevealedQuizCard",
  component: RevealedQuizCard,
};

const Template: Story<RevealedQuizCardProps> = (args: RevealedQuizCardProps) => <RevealedQuizCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  progressBarPercentage: 20,
  exampleSentences: [
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
  ],
  cardInfo: {
    romanization: "Romanized",
    knownLanguage: "Known",
    dictionaryDefinition: "Definition",
    sound: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  },
};
