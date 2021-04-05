import React, { useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'

export const GlobalDragOver = () => {
    const m = useContext(ManagerContext)
    const languageCode = useObservableState(m.languageConfigsService.readingLanguageCode$);
    const [draggingFilesOver, filesDraggedOver] = useState<boolean>(false)
    useEffect(() => {
        document.body.ondragover = (e) => {
            e.preventDefault()
            if (
                e.dataTransfer &&
                Array.from(e.dataTransfer.items).filter(
                    (v) => v.kind === 'file',
                )
            ) {
                filesDraggedOver(true)
            }
        }
        document.body.ondragleave = (e) => {
            e.preventDefault()
            filesDraggedOver(false)
        }
        document.body.ondrop = (e) => {
            e.preventDefault()
            filesDraggedOver(false);
            if (e.dataTransfer && languageCode) {
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    const file = e.dataTransfer.files[i]
                    m.uploadingDocumentsService.upload({file, languageCode})
                }
            }
        }
    }, [])
    return (
        <div
            className={`dropzone-container ${
                draggingFilesOver ? 'files-being-dragged' : ''
            }`}
        />
    )
}
