import React, {useContext, useState} from 'react';
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";


export const NameUploadDialog: React.FC = ({}) => {
    const [name, setName] = useState('');
    const m = useContext(ManagerContext);
    const language_code = useObservableState(m.languageConfigsService.readingLanguageCode$);
    const currentPicture = useObservableState((m.takenPictureService.currentPicture$));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (currentPicture && language_code) {
            await m.uploadingDocumentsService.upload({file: currentPicture, language_code})
        }
        m.takenPictureService.currentPicture$.next(undefined);
        m.modalService.fileUpload.open$.next(false);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    return (
        <div>
            <h2>Upload a File</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" value={name} onChange={handleInputChange} />
                </label>
                <button type="submit">Upload</button>
                <button type="button" onClick={() => {
                    m.takenPictureService.currentPicture$.next(undefined);
                    m.modalService.fileUpload.open$.next(false);
                }}>
                    Cancel
                </button>
            </form>
        </div>
    );
};
