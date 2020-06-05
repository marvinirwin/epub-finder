import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import React from "react";
import {Dictionary} from "lodash";
import CardScroller from "./CardScroller";
import {UnserializedAnkiPackage} from "../lib/worker-safe/SerializedAnkiPackage";
import {ReplaySubject} from "rxjs";
import {ICard} from "../AppDB";
import {useObs} from "../UseObs";
import {Manager} from "../managers/Manager";

/**
 * This function assumes there is only one collection per package, it can trivially be made to support more
 * @param ankiPackages
 * @constructor
 */
export function CardTree({ankiPackages, selectedPackage$}: { ankiPackages: Dictionary<UnserializedAnkiPackage>, selectedPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> }) {
    return <div>
        <h3>Cards</h3>
        <TreeView style={{height: 240, flexGrow: 1, maxWidth: 400}} defaultExpanded={[]}>
            {Object.entries(ankiPackages).map(([name, p], pi) => {
                    if (p.collections) {
                        return <TreeItem key={pi} nodeId={`c${pi}`} label={name} onClick={() => selectedPackage$.next(p)}>
                            {p.collections[0].decks.filter(d => d.cards.length).map((d, di) =>
                                <TreeItem key={di} nodeId={`c${pi}d${di}`} label={d.name}>
                                    {/*<CardScroller cards={d.cards}/>*/}
                                </TreeItem>
                            ) }
                        </TreeItem>;
                    }
                }
            )}
        </TreeView>
    </div>
}

export function Cards({cardManager}: {cardManager: Manager}) {
    const cards = useObs<ICard[] | undefined>(cardManager.currentCards$);
    return cards ? <CardScroller cards={cards}/> : <div/>
}