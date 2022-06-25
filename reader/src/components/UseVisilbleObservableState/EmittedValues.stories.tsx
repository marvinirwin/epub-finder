/* eslint-disable */
import React from "react";
import { EmittedValues } from "./EmittedValues.component";
import { EmittedValuesProps } from "./EmittedValuesProps";

export default {
  title: "EmittedValues"
};

export const Default = (args: EmittedValuesProps) => <EmittedValues {...args} />;

Default.story = {
  name: "default"
};
Default.args = {
  emittedValues: [{
    id: 0,
    value: "event fired",
    formatFn: v => v.toString()
  }],
  id: "storybook"
} as EmittedValuesProps;
