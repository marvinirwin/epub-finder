import React, {useContext, useState} from "react";
import {priorityMouseoverHighlightWord} from "../../../lib/manager/cards.repository";
import {flatten} from "lodash";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../../../App";

export const ManualMouseover = () => {
    const m = useContext(ManagerContext);
    const segments = useObservableState(m.openDocumentsService.displayDocumentTabulation$)?.segments || [];
    const nodes = flatten(segments.map(segment => [...segment.getSentenceHTMLElement().children])) as HTMLElement[];
    const [manualMouseoverHighlight, setManualMouseoverHighlight] = useState<HTMLInputElement | null>()
    return <div>
        <input
        id={'manual-mouseover-highlight-coordinates'}
        ref={setManualMouseoverHighlight}
    />

        <button
            id={'manual-mouseover-highlight-button'}
            onClick={() => {
                const atomMetadata = m.elementAtomMetadataIndex.metadataForElement(
                    nodes[parseInt(manualMouseoverHighlight?.value as string)]
                );
                if (atomMetadata) {
                    m.mousedOverWordHighlightService.mousedOverWord$.next(
                        priorityMouseoverHighlightWord({
                            atomMetadata,
                            cardsRepository: m.cardsRepository
                        })?.learningLanguage || ''
                    )
                }

            }}
        />
    </div>
}