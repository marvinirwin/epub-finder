// YourComponent.stories.js|jsx
import React from 'react'
import { MenuLandingPage } from "./menuLandingPage.component";

export default {
  title: 'MenuLandingPage',
  component: MenuLandingPage,
};

//👇 We create a “template” of how args map to rendering
const Template = (args: any) => <MenuLandingPage {...args} />;

export const Default = Template.bind({});
