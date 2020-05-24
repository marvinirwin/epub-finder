import {useState} from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import {Divider} from "@material-ui/core";
import {Card} from "../worker-safe/Card";
import React from "react";

export default function CardScroller({cards}: { cards: Card[] }) {
    const [limit, setLimit] = useState(20);

    return <div>
        <div>
            {cards.slice(0, limit).map((question, i) => <div
                key={i}
                style={{border: 'thin black 1px', borderRadius: '5px'}} >
                {question.matchCriteria}
            </div>)
            }
        </div>

        <button onClick={() => setLimit(limit + 50)}>({cards.length - limit})...</button>
    </div>
}