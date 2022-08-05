import React from "react";
import { Story } from "@storybook/react";
import { MenuLandingPage, MenuLandingPageProps } from "./menu-landing-page.component";

export default {
  title: "MenuLandingPage",
  component: MenuLandingPage,
  parameters: {
    docs: {
      inlineStories: false,
      iframeHeight: 800,
    },
  },
};

const Template: Story<MenuLandingPageProps> = (args: MenuLandingPageProps) => <MenuLandingPage {...args} />;

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
