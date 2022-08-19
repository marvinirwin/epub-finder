import React from "react";
import { Story } from "@storybook/react";
import { QuizProgressBar, QuizProgressBarProps } from "./quiz-progress-bar.component";

export default {
  title: "QuizProgressBar",
  component: QuizProgressBar,
};

const Template: Story<QuizProgressBarProps> = (args: QuizProgressBarProps) => (
  <div className="w-[600px]">
    <QuizProgressBar {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
    progressBarPercentage: 20,
};
