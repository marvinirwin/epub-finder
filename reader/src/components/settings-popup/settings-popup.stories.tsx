import React, { useState } from "react";
import {Story} from '@storybook/react';
import { SettingsPopup, SettingsPopupProps } from "./settings-popup.component";

export default {
  title: "SettingsPopup",
  component: SettingsPopup,
  parameters: {
    docs: {
      inlineStories: false,
        iframeHeight: 500,
    },
  },
};

const Template: Story<SettingsPopupProps> = (args: SettingsPopupProps) => {
  const [showSettings, setShowSettings] = useState(true);
  return (
    <div className="w-full h-full relative">
      <SettingsPopup {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
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