import React, {useEffect, useState} from "react";
import Plot from 'react-plotly.js';
import {WavAudio} from "../../lib/WavAudio";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    graphParent: {
        width: '100%',
    }
}));
export default function MultiGraphComponent({plots}: {plots: number[][]}) {
    const classes = useStyles();
    const [ rev, setRev ] = useState(0)
    useEffect(() => {
        setRev(rev + 1);
    }, [])
    return <div className={classes.graphParent}>
        <Plot data={
            plots.map((stream, i) => {
                return {
                    x: stream.map((_, i) => i + 1),
                    y: stream,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: ['red', 'green']},
                }
            })
        } layout={{title: 'Sound recording'}}
              revision={rev}
        />
    </div>
}