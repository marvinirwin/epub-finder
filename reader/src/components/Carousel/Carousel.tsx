import React, {FunctionComponent, useEffect, useState} from "react";

/*
export const Carousel: FunctionComponent<{currentIndex: number}> = ({ currentIndex, children}) => {
    const [offsets, setOffsets] = useState<number[]>([]);
    const [ref, setRef] = useState();
    useEffect(() => {
        if (ref) {
            // @ts-ignore
            const newOffsets = Array(children.length).fill(0);
            // @ts-ignore
            const width = ref.clientWidth;
            newOffsets.forEach((_, childIndex) => {
                newOffsets[childIndex] = (currentIndex - childIndex) * width;
            });
            setOffsets(newOffsets);
        }
    }, [currentIndex, children, ref]);

    return (
        <div ref={setRef} style={{
            position: "relative",

        }}>
            {React.Children.map(children, (child, i) => {
                return <div
                    key={i}>
                    // @ts-ignore
                    {React.cloneElement(child, {
                        style: {
                            // @ts-ignore
                            ...child.props.style,
                            ...{
                                transform: `translate(${offsets[i]}px)`,
                                transition: `1s`,
                                position: "absolute",
                            }
                        }
                    })}
                </div>
            })}
        </div>
    );
}
*/


