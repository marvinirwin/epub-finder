import {ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager} from "../../lib/Manager";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {useObservableState} from "observable-hooks";
import {PlaybackSpeedComponent} from "./playback-speed.component";
import {VideoMetadata} from "../PronunciationVideo/video-meta-data.interface";
import {arrayToTreeRoot} from "./directory.factory";
import {ReadingNode} from "./nodes/reading.component";
import {WatchMode} from "./modes/watch-mode.component";
import {SpeakMode} from "./modes/speak-mode.component";
import {TreeMenuNode} from "./tree-menu-node.interface";
import {IconButton} from "@material-ui/core";
import GoogleIcon from "../Icons/GoogleIcon";
import TwitterIcon from "../Icons/TwitterIcon";
import {FileChooser} from "./file-chooser.component";
import {toTreeMenuNode} from "../../lib/book-selection/book-selection-tree-menu-node";
import {RequestRecordingSentences} from "./request-record-sentences.component";

const DEVELOPER_MODE = localStorage.getItem("DEVELOPER_MODE");


export const AllSentences: React.FC<{ m: Manager }> = ({m}) => {
    const allSentences = useObservableState(m.videoMetadataService.allSentenceMetadata$, []);

    return <div className={'all-sentences'}>
        {allSentences.map(sentenceMetadata => <Sentence key={sentenceMetadata.sentence}
                                                        sentenceMetadata$={sentenceMetadata.metadata$}
                                                        sentence={sentenceMetadata.sentence}/>)}
    </div>
}

export const Sentence: React.FC<{ sentenceMetadata$: Observable<VideoMetadata>, sentence: string }> = ({sentence, sentenceMetadata$}) => {
    const metadata = useObservableState(sentenceMetadata$);
    return <div style={{backgroundColor: metadata ? 'white' : 'pink'}}>
        {sentence}
    </div>
}


export const AppDirectoryService = (m: Manager): Observable<ds_Tree<TreeMenuNode>> => {
    // This is going to break the way I do "Selected components".
    // I should do selected components by path, that way their refs can change?
    // Also I gotta make sure all my values are unique in that loop
    return combineLatest([
        m.authManager.profile$,
        m.bookSelectionService.bookSelectionRows$,
        m.treeMenuService.selectedComponent$
    ]).pipe(
        map(([
                 profile,
                 availableBooks,
            selectedComponent
             ]) => {
            return arrayToTreeRoot<TreeMenuNode>(
                ReadingNode(m),
                [
                    ReadingNode(m, selectedComponent?.name === 'reading'),
                    {
                        name: 'watchPronunciation',
                        ReplaceComponent: WatchMode
                    },
                    {
                        name: 'recognizeSpeech',
                        ReplaceComponent: SpeakMode
                    },
                    {
                        name: 'playbackSpeed',
                        label: 'playbackSpeed',
                        InlineComponent: () => <PlaybackSpeedComponent/>
                    },
                    {
                        name: 'library',
                        label: 'Library',
                        moveDirectory: true,
                    },
                    // @ts-ignore
                    availableBooks.map(toTreeMenuNode),
                    {
                        name: 'customDocument',
                        ReplaceComponent: () => <FileChooser/>
                    },
                    {
                        name: 'requestRecording',
                        Component: () => <RequestRecordingSentences/>,
                        label: profile?.email ? 'Request Recordings' : 'Log in to request custom recordings'
                    },
                    {
                        name: 'signInWith',
                        label: 'Sign In With',
                        moveDirectory: true,
                        hidden: !!profile?.email
                    },
                    [
                        {
                            name: 'google',
                            ReplaceComponent: () => <IconButton
                                onClick={() => window.location.href = `${process.env.PUBLIC_URL}/auth/google`}>
                                <GoogleIcon/>
                            </IconButton>
                        },
                        {
                            name: 'twitter',
                            ReplaceComponent: () => <IconButton
                                onClick={() => window.location.href = `${process.env.PUBLIC_URL}/auth/twitter`}>
                                <TwitterIcon/>
                            </IconButton>,
                            hidden: true,
                        }
                    ],
                    {
                        name: 'profile',
                        label: profile?.email,
                        hidden: !!profile
                    },
                ]
            );
            /*
                        const reading = menuNodeFactory(ReadingComponent, 'Reading', 'reading', true);
            */
            /*
                        if (DEVELOPER_MODE) {
                            rootTree.children.AllSentences = constructTree(
                                'AllSentences',
                                menuNodeFactory(() => <AllSentences m={m}/>, 'AllSentences', 'AllSentences', false)
                            );
                            rootTree.children.resetIntro = {
                                nodeLabel: 'resetIntro',
                                value: {
                                    name: 'resetIntro',
                                    label: 'resetIntro',
                                    InlineComponent: () => <ListItem
                                        button
                                        onClick={() => m.settingsService.completedSteps$.next([])}
                                    >Reset tutorial
                                    </ListItem>,
                                },
                            };
                        }
            */
            // return rootTree;
        })
    )
}