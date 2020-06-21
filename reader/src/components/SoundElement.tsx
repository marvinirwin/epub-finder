import React, {useEffect, useRef} from "react";

export function SoundEl({src, playOnMount}: { src: string, playOnMount: boolean }) {
    const ref = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        if (ref?.current) {
            ref.current.play();
        }
    }, [ref])
    return <audio ref={ref} className={'new-audio'} key={src} controls={true} src={src}>This is audio</audio>;
}