import React, {useContext, useEffect, useState} from 'react';
import {ManagerContext} from '../../App';
import {useObservableState} from "observable-hooks";

type Props = {
    onClose: () => void
};

type InjectCSSProps = {
    iframeRef: HTMLIFrameElement | null;
    css: string;
    loaded: boolean
};

export const useInjectCSS = ({iframeRef, css, loaded}: InjectCSSProps): void => {
    useEffect(() => {
        const iframe = iframeRef;
        if (!iframe) return;

        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) return;
        const iframeDocument = iframeWindow.document;
        const style = iframeDocument.createElement("style");
        style.textContent = css;

        iframeDocument.head.appendChild(style);

        return () => {
            iframeDocument.head.removeChild(style);
        };
    }, [iframeRef, css]);
};


export const QuickPreviewDocument: React.FC<Props> = ({onClose}) => {
    const m = useContext(ManagerContext);
    const [height, setHeight] = useState(0);
    const url = useObservableState(m.quickPreviewService.quickPreviewDocumentUrl$)
    const [ref, setRef] = useState<HTMLIFrameElement | null>(null)
    const [loaded, setLoaded] = useState<boolean>(false);
    useInjectCSS({
        iframeRef: ref, css: `
    img {
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      object-position: center;
    }`,
        loaded
    });

    const handleLoad = () => {
        // TODO race condition here
        if (ref) {
            setLoaded(true)
            const iframeHeight = ref.contentWindow?.document.documentElement.scrollHeight;
            setHeight(iframeHeight ?? 0);
        }
    };

    return (
        <>
            <iframe
                ref={setRef}
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