/* eslint-disable */
import React from 'react';
import { EmittedValues } from "./EmittedValues.component";
import { SelectLearningLanguageBase } from "../language-select/select-learning-language.base";
import { EmittedValuesProps } from "./EmittedValuesProps";

export default {
  title: "EmittedValues",
};

export const Default = (args: EmittedValuesProps) => <EmittedValues {...args} />;

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
} as EmittedValuesProps;
