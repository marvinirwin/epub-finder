import React, { useState } from "react";
//import { LtDocument } from "../../../../server/src/shared/lt-document";

/*
export type LibraryProps = {
  documents: LtDocument[]
}

type LibraryDocument = LtDocument & {
  examplesChecked?: boolean;
  frequencyChecked?: boolean;
};
*/

export type Document = {
  id: number,
  name: string,
  examplesChecked?: boolean,
  frequencyChecked?: boolean
};

export type LibraryProps = {
  documents: Document[]
}

export const Library: React.FC<LibraryProps> = ({documents}) => {
  const [libDocs, setLibDocs] = useState(documents);

  const handleChecked = (id: number, column: 'examples' | 'frequency') => {
      const docs = libDocs.map((d: Document) => {
        if (d.id === id) d[`${column}Checked`] = !d[`${column}Checked`];
        return d;
      });
      setLibDocs(docs);
  }
  
  return (
      <table className="w-80 h-[570px] p-[10px] relative text-sm flex flex-col items-center bg-white">
        <tr className="w-[300px] h-6 mb-3 flex flex-row flex-nowrap justify-between">
          <th className="w-16 font-normal">Document</th>
          <th className="w-16 font-normal">Examples</th>
          <th className="w-16 font-normal">Frequency</th>
        </tr>
        {libDocs.map((doc: Document) => (
          <tr className="w-[300px] h-6 mb-3 flex flex-row flex-nowrap justify-between" key={doc.id}>
            <td className="w-16">{doc.name}</td>
            <td className="w-16 flex justify-center items-center">
              <input className="rounded-sm" type='checkbox' checked={doc.examplesChecked} onChange={() => handleChecked(doc.id, 'examples')} />
            </td>
            <td className="w-16 flex justify-center items-center">
              <input className="rounded-sm" type='checkbox' checked={doc.frequencyChecked} onChange={() => handleChecked(doc.id, 'frequency')} />
            </td>
          </tr>
        ))}
      </table>
  );
};
