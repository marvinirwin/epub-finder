import React from "react";
import { Story } from "@storybook/react";
import { Library, LibraryProps } from "./library.component";

export default {
  title: "Library",
  component: Library,
};

const Template: Story<LibraryProps> = (args: LibraryProps) => (
  <div className="w-full h-full bg-slate-300 flex justify-center items-center">
    <Library {...args} />
  </div>
)

export const Default = Template.bind({});
Default.args = {
  documents: [
    {
      id: 0,
      name: 'Menu 1',
      examplesChecked: true,
      frequencyChecked: true
    },
    {
      id: 1,
      name: 'Menu 2',
      examplesChecked: true,
      frequencyChecked: false
    },
    {
      id: 2,
      name: 'Menu 3',
      examplesChecked: false,
      frequencyChecked: true
    },
    {
      id: 3,
      name: 'Book 1',
      examplesChecked: false,
      frequencyChecked: false
    }
  ]
};

/*
const docOne = new DocumentView();
docOne.id = '1';
docOne.name = 'Menu 1';

const docTwo = new DocumentView();
docOne.id = '2';
docOne.name = 'Menu 2';

const docThree = new DocumentView();
docOne.id = '3';
docOne.name = 'Menu 3';

const docFour = new DocumentView();
docOne.id = '4';
docOne.name = 'Book 1';

Default.args = {
  documents: [
    new LtDocument(docOne),
    new LtDocument(docTwo),
    new LtDocument(docThree),
    new LtDocument(docFour),
  ]
};
*/