import React, {useState, useEffect, useContext} from 'react';
import { ManagerContext } from '../../App';
import {useObservableState} from "observable-hooks";

type Props = {
    onClose: () => void
};

export const QuickPreviewDocument: React.FC<Props> = ({onClose}) => {
    const m = useContext(ManagerContext);
    const [height, setHeight] = useState(0);
    const url = useObservableState(m.quickPreviewService.quickPreviewDocumentUrl$)

    const handleLoad = () => {
        const iframe = document.getElementById('seamless-iframe') as HTMLIFrameElement;
        const iframeHeight = iframe.contentWindow?.document.documentElement.scrollHeight;
        setHeight(iframeHeight ?? 0);
    };

    return (
            <>
                <iframe
                    id="seamless-iframe"
                    src={url}
                    frameBorder="0"
                    style={{width: '100%', height}}
                    onLoad={handleLoad}
                />
                <button style={{position: 'absolute', top: '1rem', right: '1rem'}} onClick={onClose}>
                    Close
                </button>
            </>
    );
};