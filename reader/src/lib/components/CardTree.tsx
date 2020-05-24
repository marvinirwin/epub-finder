import {Collection} from "../worker-safe/Collection";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import React, {Fragment} from "react";
import {AnkiPackageSerialized} from "../worker-safe/worker";
import {Dictionary} from "lodash";

/**
 * This function assumes there is only one collection per package, it can trivially be made to support more
 * @param ankiPackages
 * @constructor
 */
export function CardTree({ankiPackages}: { ankiPackages: Dictionary<AnkiPackageSerialized> }) {
    return <div>
        <TreeView style={{height: 240, flexGrow: 1, maxWidth: 400}} defaultExpanded={[]}>
            {Object.entries(ankiPackages).map(([name, p], pi) => {
                    if (p.collections) {
                        return <Fragment>
                            <TreeItem key={pi} nodeId={`c${pi}`} label={name}>
                                {p.collections[0].decks.map((d, di) =>
                                    <Fragment>
                                        <TreeItem key={di} nodeId={`c${pi}d${di}`} label={d.name}>
                                            <TreeItem nodeId={`c${pi}d${di}card${1}`} label={'I am a card'}> </TreeItem>
                                            {/*
                                        {d.cards.map((card, cardi) =>
                                            <Fragment>
                                                <TreeItem key={cardi} nodeId={`c${ci}d${di}card${cardi}`} label={'card'}>
                                                    <span dangerouslySetInnerHTML={{__html: card.interpolatedFields.join('\nDIVIDER\n')}}/>
                                                </TreeItem>
                                            </Fragment>
                                        )}
    */}
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