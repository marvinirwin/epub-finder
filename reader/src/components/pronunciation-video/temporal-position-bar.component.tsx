import React from "react";

export const TemporalPositionBarComponent: React.FunctionComponent<{ color: string, position: number | undefined }> = ({position, color}) => {
    return position !== undefined ?
        <div style={{
            position: 'absolute',
            backgroundColor: color,
            width: '1px',
            height: '100%',
            left: position
        }}/> :
        <span/>
}