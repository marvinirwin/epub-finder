import React, { useState } from "react";
import {Story} from '@storybook/react';
import { NavBarAndSettingsPopup, NavBarAndSettingsProps } from "./NavBarAndSettingsPopup.component";

export default {
  title: "SettingsPopup",
  component: NavBarAndSettingsPopup,
  parameters: {
    docs: {
      inlineStories: false,
        iframeHeight: 500,
    },
  },
};

const Template: Story<NavBarAndSettingsProps> = (args: NavBarAndSettingsProps) => {
  const [showSettings, setShowSettings] = useState(true);
  return (
    <div className="w-full h-full relative">
      <NavBarAndSettingsPopup {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  languages: [
    {
      value: "zh",
      label: "Chinese",
      variants: [
        {
          value: "zh-Hans",
          label: "Chinese (Simplified)",
        },
        {
          value: "zh-Hant",
          label: "Chinese (Traditional)",
        },
      ],
    },
    {
      value: "en",
      label: "English",
      variants: [
        {
          value: "en-CA",
          label: "English (CA)",
        },
        {
          value: "en-US",
          label: "English (US)",
        },
      ],
    },
  ],

};