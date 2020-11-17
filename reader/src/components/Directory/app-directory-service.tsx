import {constructTree, ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager, SentenceMetadata} from "../../lib/Manager";
import {Reading} from "../Reading/Reading";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {HotkeyDirectoryService} from "./hotkey-directory.service";
import {LibraryDirectoryService} from "./library-directory.service";
import {ModeDirectory} from "./mode-directory.service";
import {useObservableState} from "observable-hooks";
import {orderBy} from "lodash";

const DEVELOPER_MODE = localStorage.getItem("DEVELOPER_MODE");

export const menuNodeFactory = (
    Component: React.FunctionComponent | undefined,
    label: string,
    key: string,
    moveDirectory: boolean,
    LeftIcon?: React.Component,
    inlineComponent?: React.FunctionComponent,
    action?: () => void
): TreeMenuNode => ({
    Component,
    name: key,
    label,
    LeftIcon: LeftIcon,
    moveDirectory,
    action
});


export const AllSentences: React.FC<{ m: Manager }> = ({m}) => {
    const sentenceMetadata = useObservableState(m.allSentenceMetadata$, []);
    const sorted = orderBy(sentenceMetadata, [
        sentenceMetaData => sentenceMetaData.metadata,
    ])

    return <div className={'all-sentences'}>
        {sorted.map(sentenceMetadata => <Sentence sentenceMetadata={sentenceMetadata}/>)}
    </div>
}

export const Sentence: React.FC<{ sentenceMetadata: SentenceMetadata }> = ({sentenceMetadata}) => {
    return <div style={{backgroundColor: sentenceMetadata.metadata ? 'white' : 'pink'}}>
        {sentenceMetadata.sentence}
    </div>
}


export const AppDirectoryService = (m: Manager): Observable<ds_Tree<TreeMenuNode>> => {
    // This is going to break the way I do "Selected components".
    // I should do selected components by path, that way their refs can change?
    // Also I gotta make sure all my values are unique in that loop
    return combineLatest([
        m.library.customBooks$.dict$,
        m.db.checkedOutBooks$,
        m.library.builtInBooks$.dict$
    ]).pipe(
        map(([
                 customBooks,
                 checkedOutBooks,
                 builtInBooks
             ]) => {
            const ReadingComponent = () => <Reading m={m}/>;
            const main = menuNodeFactory(ReadingComponent, 'Reading', 'root', false);
            const reading = menuNodeFactory(ReadingComponent, 'Reading', 'reading', true);


            const rootTree = constructTree('root', main);
            rootTree.children = {
                ...ModeDirectory(m),
                reading: constructTree('reading', reading),
                library: LibraryDirectoryService(m, checkedOutBooks, {...customBooks, ...builtInBooks}),
                hotkeys: HotkeyDirectoryService(m),
            };
            if (DEVELOPER_MODE) {
                rootTree.children.AllSentences = constructTree(
                    'AllSentences',
                    menuNodeFactory(() => <AllSentences m={m}/>, 'AllSentences', 'AllSentences', false)
                )
            }
            return rootTree;
        })
    )
}