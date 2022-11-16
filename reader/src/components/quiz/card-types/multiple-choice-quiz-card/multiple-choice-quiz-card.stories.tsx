import React from "react";
import { Story } from "@storybook/react";
import { MultipleChoiceQuizCard, MultipleChoiceQuizCardProps } from "./multiple-choice-quiz-card.component";

export default {
  title: "MultipleChoiceQuizCard",
  component: MultipleChoiceQuizCard,
};

const Template: Story<MultipleChoiceQuizCardProps> = (args: MultipleChoiceQuizCardProps) => (
  <div className="w-full h-full relative">
    <MultipleChoiceQuizCard {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
    progressBarPercentage: 20,
    quizScore: 140,
    word: 'you',
    answerOptions: [
        {id: 1, label: 'jì'},
        {id: 2, label: 'hé'},
        {id: 3, label: 'tā'},
        {id: 4, label: 'nĭ'},
    ],
    handleOptionClick: () => {}
};
