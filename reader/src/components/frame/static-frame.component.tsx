import React, {
    CSSProperties,
    FunctionComponent,
    useEffect,
    useState,
} from 'react'

interface Props {
    visible: boolean
    visibleStyle: CSSProperties
  children?: React.ReactNode
}
export const StaticFrameComponent: FunctionComponent<Props> = ({
    visible,
    visibleStyle,
    children,
}) => {
    const [el, setEl] = useState()
    const divStyle = visible
        ? visibleStyle
        : {
              zIndex: -1,
              width: '100vw',
              height: '10vh',
              overflow: 'hidden',
          }
    return (
        <div
            style={{
                ...divStyle,
                position: 'absolute',
            }}
        >
            {children}
        </div>
    )
}
