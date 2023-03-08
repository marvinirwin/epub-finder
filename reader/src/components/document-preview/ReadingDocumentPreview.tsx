import React, {useState, useEffect} from 'react';
import {OpenDocumentComponent} from "../reading/open-document.component";
import {ReadingComponent} from "../reading/reading.component";

type Props = {
    onClose: () => void
};

export const ReadingDocumentPreview: React.FC<Props> = ({ onClose}) => {
    return (
        <div>
            <ReadingComponent/>
            <button style={{position: 'absolute', top: '1rem', right: '1rem'}} onClick={onClose}>
                Close
            </button>
        </div>
    );
};
