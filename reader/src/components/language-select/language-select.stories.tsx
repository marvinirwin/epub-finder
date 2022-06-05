/* eslint-disable */
import React from 'react';
import { SelectLearningLanguageBase, SelectLearningLanguageBaseProps } from "./select-learning-language.base";

export default {
  title: "LanguageSelect",
};

export const Default = (args: SelectLearningLanguageBaseProps) => <SelectLearningLanguageBase {...args} />;

Default.story = {
  name: 'default',
};
Default.args = {
  value: 'ko',
  options: [
    {
      label: "French",
      code: 'fr'
    },
    {
      label: "Korean",
      code: "ko"
    },
    {
      label: "Simplified Chinese",
      code: "zh-CN-Simplified"
    }
  ],
  onChange: () => undefined,
} as SelectLearningLanguageBaseProps
