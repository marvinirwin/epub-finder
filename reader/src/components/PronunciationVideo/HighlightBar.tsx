import React from "react";

export const HighlightBar: React.FunctionComponent<{setHighlightBar: (bar: HTMLDivElement) => void}> = ({setHighlightBar}) => {
    return <div ref={setHighlightBar} style={{
        position: 'absolute',
        backgroundColor: 'blue',
        opacity: '50%',
        height: '100%',
    }}>
    </div>
}