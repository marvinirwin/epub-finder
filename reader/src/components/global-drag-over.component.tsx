import React, {useContext, useEffect, useState} from "react";
import {ManagerContext} from "../App";

export const GlobalDragOver = () => {
    const m = useContext(ManagerContext);
    const [draggingFilesOver, filesDraggedOver] = useState<boolean>(false);
    useEffect(() => {
        document.body.ondragover = e => {
            e.preventDefault();
            if (e.dataTransfer && Array.from(e.dataTransfer.items).filter(v => v.kind === 'file')) {
                filesDraggedOver(true);
            }
        };
        document.body.ondragleave = e => {
            e.preventDefault();
            filesDraggedOver(false);
        }
        document.body.ondrop = (e) => {
            e.preventDefault();
            filesDraggedOver(false);
            e.dataTransfer && m.droppedFilesService.uploadFileRequests$.next(Array.from(e.dataTransfer.files))
        }
    }, [])
    return <div
    className={`dropzone-container ${draggingFilesOver ? 'files-being-dragged' : ''}`}
    />;
}