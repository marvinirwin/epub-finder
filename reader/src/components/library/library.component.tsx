import React, {useContext, useState} from "react";
import {LibraryDocumentRow} from "../../lib/manager/library-document-row";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../../App";

export type LibraryProps = {}

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
    return <tr key={document.ltDocument.id()}>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
            {document.ltDocument.name}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            {
                <input
                    className="rounded-sm"
                    type="checkbox"
                    checked={isUsedForFrequency}
                    onChange={() => document.toggleUseForFrequency()}
                />
            }
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            {
                <input
                    className="rounded-sm"
                    type="checkbox"
                    checked={isUsedForExamples}
                    onChange={() => document.toggleUseForExamples()}
                />
            }
        </td>
    </tr>;
};

export const Library: React.FC<LibraryProps> = ({}) => {
    const m = useContext(ManagerContext);
    const documents = Array.from(useObservableState(m.documentRepository.collection$)?.values() || []);
    return (
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Media Sources</h1>
                    <p className="mt-2 text-sm text-gray-700">
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Media Source
                    </button>
                </div>
            </div>
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Name
                                    </th>
                                    <th scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Example Source
                                    </th>
                                    <th scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Frequency Source
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {
                                    documents.map((doc) => {
                                        const d = new LibraryDocumentRow({
                                            settingsService: m.settingsService,
                                            ltDocument: doc,
                                            frequencyDocumentRepository:
                                            m.frequencyDocumentsRepository,
                                            readingDocumentRepository:
                                            m.documentRepository,
                                        })
                                        return (
                                            <LibraryRow key={d.ltDocument.id()} document={d}/>
                                        );
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
