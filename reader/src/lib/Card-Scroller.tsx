import {useState} from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import {Divider} from "@material-ui/core";
import {Card} from "./worker-safe/Card";
import React from "react";
export default function CardScroller({cards}: {cards: Card[]}) {
    const [limit, setLimit] = useState(20);
    return <InfiniteScroll
        dataLength={limit}
        next={() => setLimit(limit + 20)}
        hasMore={cards.length > limit}
        loader={<h4>Loading...</h4>}
    >
        {cards.slice(0, limit).map((question, i) => <div
            key={i}
            style={{border: 'thin black 1px', borderRadius: '5px'}}
        >
            {question.fields.map(f =>
                <div >
                    <Divider light />
                    <div dangerouslySetInnerHTML={{__html: f}}/>
                    <Divider light />
                </div>
            )
            }
        </div>)
    }
    </InfiniteScroll>
}