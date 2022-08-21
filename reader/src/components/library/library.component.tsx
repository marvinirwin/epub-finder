import React, { useContext, useState } from "react";
import { LibraryDocumentRow } from "../../lib/manager/library-document-row";
import { useObservableState } from "observable-hooks";
import { ManagerContext } from "../../App";

export type LibraryProps = {
}

const LibraryRow = (
  {
                        document
                      }: { document: LibraryDocumentRow }) => {
  const m = useContext(ManagerContext);
  const frequencyDocuments = useObservableState(
    m.settingsService.selectedFrequencyDocuments$
  );
  const exampleSentences = useObservableState(
    m.settingsService.selectedExampleSegmentDocuments$
  );
  const isUsedForFrequency = !!frequencyDocuments?.includes(document.ltDocument.id());
  const isUsedForExamples = !!exampleSentences?.includes(document.ltDocument.id());
  return <tr className="w-[300px] h-6 mb-3 flex flex-row flex-nowrap justify-between">
    <td className="w-16">{document.ltDocument.name}</td>
    <td className="w-16 flex justify-center items-center">
      <input
        className="rounded-sm"
        type="checkbox"
        checked={isUsedForFrequency}
        onChange={() => document.toggleUseForFrequency()}
      />
    </td>
    <td className="w-16 flex justify-center items-center">
      <input
        className="rounded-sm"
        type="checkbox"
        checked={isUsedForExamples}
        onChange={() => document.toggleUseForExamples()}
      />
    </td>
  </tr>;
};

export const Library: React.FC<LibraryProps> = ({}) => {
  const m = useContext(ManagerContext);
  const documents = Array.from(useObservableState(m.documentRepository.collection$)?.values() || []);
  return (
    <table className="w-80 h-[570px] p-[10px] relative text-sm flex flex-col items-center bg-white">
      <tr className="w-[300px] h-6 mb-3 flex flex-row flex-nowrap justify-between">
        <th className="w-16 font-normal">Document</th>
        <th className="w-16 font-normal">Examples</th>
        <th className="w-16 font-normal">Frequency</th>
      </tr>
      {documents.map((doc) => {
        const d = new LibraryDocumentRow({
          settingsService: m.settingsService,
          ltDocument: doc,
          frequencyDocumentRepository:
          m.frequencyDocumentsRepository,
          readingDocumentRepository:
          m.documentRepository,
        })
        return (
          <LibraryRow key={d.ltDocument.id()} document={d} />
        );
      })}
    </table>
  );
};
