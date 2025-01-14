import React, { useContext, useState } from 'react'
import { flatten } from 'lodash'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../../App'
import { priorityMouseoverHighlightWord } from '../../../lib/manager/priority-mouseover-highlight-word'

export const ManualMouseover = () => {
    const m = useContext(ManagerContext)
    const segments = flatten(useObservableState(m.openDocumentsService.displayDocumentTabulation$)?.map(v => v.segments) || [])
    const nodes = flatten(
        segments.map((segment) => [
            ...segment.getSentenceHTMLElement().children,
        ]),
    ) as HTMLElement[]
    const [
        manualMouseoverHighlight,
        setManualMouseoverHighlight,
    ] = useState<HTMLInputElement | null>()
    return (
        <div>
            <input
                id={'manual-mouseover-highlight-coordinates'}
                ref={setManualMouseoverHighlight}
            />

            <button
                id={'manual-mouseover-highlight-button'}
                onClick={() => {
                    const atomMetadata = m.elementAtomMetadataIndex.metadataForElement(
                        nodes[
                            parseInt(manualMouseoverHighlight?.value as string)
                        ],
                    )
                    if (atomMetadata) {
                        m.mousedOverWordHighlightService.mousedOverWord$.next(
                            priorityMouseoverHighlightWord({
                                atomMetadata,
                                cardsRepository: m.cardsRepository,
                            })?.learning_language || '',
                        )
                    }
                }}
            />
        </div>
    )
}
