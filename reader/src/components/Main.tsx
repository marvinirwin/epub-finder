import {AppSingleton} from "../AppSingleton";
import {useObs} from "../lib/Worker/UseObs";
import React, {useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {BottomNav} from "./BottomNav";
import {PopupElements} from "./PopupElements";
import {Manager, NavigationPages} from "../lib/Manager";
import {ReadingPage} from "./Pages/ReadingPage";
import {TrendsPage} from "./Pages/TrendsPage";
import {QuizPage} from "./Pages/QuizPage";
import {SettingsPage} from "./Pages/SettingsPage";
import {Grid} from "@material-ui/core";
import {BookContainer} from "./BookContainer";
import {Dictionary} from "lodash";
import {RenderingBook} from "../lib/Books/Rendering/RenderingBook";

window.addEventListener("dragover", function (e) {
    e.preventDefault();
}, false);
window.addEventListener("drop", function (e) {
    e.preventDefault();
}, false);


const recordAudio = () => {
    return new Promise<Blob>(resolve => {
    });
};


/*
function plotData(normalizedData: number[]) {
    const plotEl = $('<div></div>');
    plotEl.appendTo(document.body);
    Plotly.newPlot(plotEl[0], [{
        x: normalizedData.map((_, i) => i + 1),
        y: normalizedData
    }], {
        margin: {t: 0}
    });
}
*/

/*
async function graphAudioData(
    audioData: AudioBuffer,
    filterData: (audioBuffer: AudioBuffer) => any[],
    normalizeData: (filteredData: number[]) => number[],
    firstDerivative: (points: number[]) => number[],
    base64: string) {
    const filteredData = filterData(audioData);
    const normalizedData = normalizeData(filteredData);
    const derivedData = firstDerivative(normalizedData);
    plotData(normalizedData);
    plotData(derivedData);

    var snd = new Audio("data:audio/wav;base64," + base64);
    snd.controls = true;
    snd.style.position = 'absolute';
    snd.style.zIndex = '10000';
    document.body.appendChild(snd);
}
*/


/*
axios.post('/get-speech', {text: '大家好 加拿大人'}).then(async result => {
    const SynthesizedDecodedWavFile = decode(result.data);
    const firstDerivative = (points: number[]) => {
        if (points.length <= 1) {
            throw new Error("Cannot compute derivative of 0 or 1 length array");
        }
        const newPoints = Array.from(points).fill(0);
        let prevPoint = points[0];
        for (let i = 1; i < points.length - 1; i++) {
            let nextPoint = points[i];
            newPoints[i] = nextPoint - prevPoint;
            prevPoint = nextPoint;
        }
        return newPoints;
    }

    const audioData = await audioContext.decodeAudioData(SynthesizedDecodedWavFile)

    let recordedAudio = localStorage.getItem("DECODED_WAV");
    if (!recordedAudio) {
        const audioBlob: Blob = await recordAudio();
        let arrayBuffer = await new Response(audioBlob).arrayBuffer();
        recordedAudio = encode(arrayBuffer)
        localStorage.setItem("DECODED_WAV", recordedAudio);
    }
    const audioData = await audioContext.decodeAudioData(decode(recordedAudio));
    await graphAudioData(audioData, filterData, normalizeData, firstDerivative, result.data);
    await graphAudioData(, filterData, normalizeData, firstDerivative, recordedAudio);
})
*/

const useStyles = makeStyles((theme) => ({
    root: {
        flexFlow: 'column nowrap',
        '& > *': {
            borderRadius: 0
        },
        height: '100vh',
        width: '100vw',
        display: 'flex'
    },
    middle: {
        flexGrow: 1
    },
    bookList: {
        display: 'flex',
        flexFlow: 'column nowrap',

    },
}));


function resolveCurrentComponent(item: NavigationPages | undefined, m: Manager) {
    switch (item) {
        case NavigationPages.QUIZ_PAGE:
            return <QuizPage m={m}/>
        case NavigationPages.TRENDS_PAGE:
            return <TrendsPage m={m}/>
        case NavigationPages.READING_PAGE:
            return <ReadingPage m={m}/>
        case NavigationPages.SETTINGS_PAGE:
            return <SettingsPage m={m}/>
        default:
            return <ReadingPage m={m}/>
    }
}

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
    const classes = useStyles();
    const item = useObs(m.bottomNavigationValue$);
    const SelectedPage = resolveCurrentComponent(item, m);
    useEffect(() => {
        m.applyGlobalListener(document.body);
    }, [m]);
    const books = useObs<Dictionary<RenderingBook>>(m.bookDict$);
    const iframeVisible = item === NavigationPages.READING_PAGE;

    return <div>
        <div style={{
            position: 'absolute',
            maxHeight: '90vh',
            minHeight: '90vh',
            maxWidth: '100vw',
            minWidth: '100vw',
            top: iframeVisible ? 0 : '9000px'
        }}>
            {Object.values(books || {}).map(b => <BookContainer m={m} key={b.name} rb={b}/>)}
        </div>
        <PopupElements m={m}/>
        <div style={{maxHeight: '90vh', minHeight: '90vh', overflow: 'auto'}}>
            {SelectedPage}
        </div>
        <BottomNav m={m}/>
    </div>;
}