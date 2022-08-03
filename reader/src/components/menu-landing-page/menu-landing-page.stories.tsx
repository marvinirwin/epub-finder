import React from 'react'
import { MenuLandingPage, MenuLandingPageProps } from "./menu-landing-page.component";

export default {
  title: 'MenuLandingPage',
  component: MenuLandingPage,
};

const Template = (args: MenuLandingPageProps) => <MenuLandingPage {...args} />;

export const Default = Template.bind({});
