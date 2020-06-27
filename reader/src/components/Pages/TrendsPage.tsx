import {Manager} from "../../lib/Manager/Manager";
import {useObs} from "../../UseObs";
import React from "react";

export function TrendsPage({m}: { m: Manager }) {
    const trends = useObs(m.allTrends$);
    // Put all the trends in a select?
    // One half will be trends the other half will be tweets from that trend
    return <div style={{display: 'grid', gridTemplateColumns: '50% 50%'}}>
        <div>

        </div>
        <div style={{maxHeight: '90vh', minHeight: '90vh', overflow: 'auto'}}>

        </div>
    </div>
}