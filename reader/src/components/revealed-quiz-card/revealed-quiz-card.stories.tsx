import React from 'react'
import { RevealedQuizCard, RevealedQuizCardProps } from "./revealed-quiz-card.component";

export default {
  title: 'RevealedQuizCard',
  component: RevealedQuizCard,
};

const Template = (args: RevealedQuizCardProps) => <RevealedQuizCard {...args} />;

export const Default = Template.bind({});
