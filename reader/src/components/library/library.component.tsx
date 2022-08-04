import React from "react";
import { LtDocument } from "../../../../server/src/shared/lt-document";

export type LibraryProps = {
  documents: LtDocument[]
}

export const Library: React.FC<LibraryProps> = ({}) => {
  
  return (
      <table className="w-[900px] h-[700px] relative">
        <tr>
          <th>Document</th>
          <th>Examples</th>
          <th>Frequency</th>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table>
  );
};
