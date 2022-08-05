import React from "react";
import { Story } from "@storybook/react";
import { SettingsPopup } from "../settings-popup/settings-popup.component";
import { RevealedQuizCard, RevealedQuizCardProps } from "./revealed-quiz-card.component";

export default {
  title: "RevealedQuizCard",
  component: RevealedQuizCard,
  parameters: {
    docs: {
      inlineStories: false,
      iframeHeight: 800,
    },
  },
};

const Template: Story<RevealedQuizCardProps> = (args: RevealedQuizCardProps) => (
  <div className="w-full h-full relative">
    <SettingsPopup {...defaultSettingsProps} />
    <RevealedQuizCard {...args} />
  </div>
);

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

const defaultSettingsProps = {
  languages: [
    {
      value: "zh",
      name: "Chinese",
      variants: [
        {
          value: "zh-Hans",
          name: "Chinese (Simplified)",
        },
        {
          value: "zh-Hant",
          name: "Chinese (Traditional)",
        },
      ],
    },
    {
      value: "en",
      name: "English",
      variants: [
        {
          value: "en-CA",
          name: "English (CA)",
        },
        {
          value: "en-US",
          name: "English (US)",
        },
      ],
    },
  ],
  onLanguageSelect: () => {},
  onVariantSelect: () => {},
};
