import React, { useState } from "react";
import { LtDocument } from "../../../../server/src/shared/lt-document";

export type LibraryProps = {
  documents: LtDocument[]
}

type LibraryDocument = LtDocument & {
  examplesChecked?: boolean;
  frequencyChecked?: boolean;
};

export const Library: React.FC<LibraryProps> = ({documents}) => {
  const [libDocs, setLibDocs] = useState(documents);

  const handleChecked = (id: string, column: string) => {
    if (column === 'example') {
      // handle example checkbox 
    } else {
      // handle frequency checkbox clicked
    }
  }

  
  return (
      <table className="w-[900px] h-[700px] relative">
        <tr>
          <th>Document</th>
          <th>Examples</th>
          <th>Frequency</th>
        </tr>
        {libDocs.map((doc: LibraryDocument) => (
          <tr key={doc.id()}>
            <td>{doc.name}</td>
            <td>
              <input type='checkbox' checked={doc.examplesChecked} onChange={() => handleChecked(doc.id(), 'example')} />
            </td>
            <td>
              <input type='checkbox' checked={doc.frequencyChecked} onChange={() => handleChecked(doc.id(), 'frequency')} />
            </td>
          </tr>
        ))}
      </table>
  );
};
