import {Collection} from "../worker-safe/Collection";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import React, {Fragment} from "react";
import {Dictionary} from "lodash";
import CardScroller from "./Card-Scroller";
import {SerializedAnkiPackage, UnserializedAnkiPackage} from "../worker-safe/SerializedAnkiPackage";

/**
 * This function assumes there is only one collection per package, it can trivially be made to support more
 * @param ankiPackages
 * @constructor
 */
export function CardTree({ankiPackages}: { ankiPackages: Dictionary<UnserializedAnkiPackage> }) {
    return <div>
        <TreeView style={{height: 240, flexGrow: 1, maxWidth: 400}} defaultExpanded={[]}>
            {Object.entries(ankiPackages).map(([name, p], pi) => {
                    if (p.collections) {
                        return <Fragment>
                            <TreeItem key={pi} nodeId={`c${pi}`} label={name}>
                                {p.collections[0].decks.filter(d => d.cards.length).map((d, di) =>
                                    <Fragment>
                                        <TreeItem key={di} nodeId={`c${pi}d${di}`} label={d.name}>
                                            <CardScroller cards={d.cards}/>
                                        </TreeItem>
                                    </Fragment>)
                                }
                            </TreeItem>
                        </Fragment>;
                    }
                }
            )}
        </TreeView>
    </div>
}