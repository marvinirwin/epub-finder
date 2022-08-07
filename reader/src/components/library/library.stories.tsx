import React from "react";
import { Story } from "@storybook/react";
import { Library, LibraryProps } from "./library.component";
import { LtDocument } from "../../../../server/src/shared/lt-document";
import { DocumentView } from "../../../../server/src/entities/document-view.entity";

export default {
  title: "Library",
  component: Library,
};

const Template: Story<LibraryProps> = (args: LibraryProps) => <Library {...args} />;

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

export const Default = Template.bind({});
Default.args = {
  documents: [
    new LtDocument(docOne),
    new LtDocument(docTwo),
    new LtDocument(docThree),
    new LtDocument(docFour),
  ]
};
