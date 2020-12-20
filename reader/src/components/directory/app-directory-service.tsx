import {ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager} from "../../lib/Manager";
import {combineLatest, Observable} from "rxjs";
import {distinctUntilChanged, map, startWith} from "rxjs/operators";
import {PlaybackSpeedComponent} from "./playback-speed.component";
import {ArrayToTreeParams, arrayToTreeRoot} from "./directory.factory";
import {ReadingNode} from "./nodes/reading.component";
import {WatchMode} from "./modes/watch-mode.component";
import {SpeakMode} from "./modes/speak-mode.component";
import {TreeMenuNode} from "./tree-menu-node.interface";
import {FileChooser} from "./file-chooser.component";
import {toTreeMenuNode} from "../../lib/document-selection/document-selection-tree-menu-node";
import GoogleButton from "react-google-button";
import {ToggleTranslate} from "./toggle-translate";

const DEVELOPER_MODE = localStorage.getItem("DEVELOPER_MODE");


export const AppDirectoryService = (m: Manager): Observable<ds_Tree<TreeMenuNode>> => {
    // This is going to break the way I do "Selected components".
    // I should do selected components by path, that way their refs can change?
    // Also I gotta make sure all my values are unique in that loop
    return combineLatest([
        m.authManager.profile$.pipe(
            startWith(undefined)
        ),
        m.documentSelectionService.documentSelectionRows$.pipe(
            startWith([])
        ),
        m.treeMenuService.selectedComponent$.pipe(
            startWith(undefined),
            map(c => c?.name),
            distinctUntilChanged(),
        )
    ]).pipe(
        map(([
                 profile,
                 availableDocuments,
                 selectedComponent
             ]) => {
            return arrayToTreeRoot<TreeMenuNode>(
                ReadingNode(m),
                [
                    ReadingNode(m, selectedComponent === 'reading'),
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
                    /*
                                        {
                                            name: 'library',
                                            label: 'Library',
                                            moveDirectory: true,
                                        },
                    */
                    {
                        name: 'signOut',
                        label: 'Sign Out',
                        action: () => m.authManager.signOut(),
                        LeftIcon: () => {
                        },
                        hidden: !profile?.email
                    },
                    {
                        name: 'customDocument',
                        ReplaceComponent: () => <FileChooser/>,
                    },
                    // @ts-ignore
                    ...availableDocuments.map(toTreeMenuNode),
                    /*
                                        {
                                            name: 'requestRecording',
                                            Component: () => <RequestRecordingSentences/>,
                                            label: profile?.email ? 'Request Recordings' : 'Log in to request custom recordings',
                                            hidden: !profile?.email
                                        },
                    */
                    {
                        name: 'signInWith',
                        label: 'Sign In With',
                        moveDirectory: true,
                        hidden: !!profile?.email
                    },
                    [
                        {
                            name: 'google',
                            ReplaceComponent: () => <GoogleButton
                                onClick={() => window.location.href = `${process.env.PUBLIC_URL}/auth/google`}
                            /> /*<IconButton
                                onClick={() => }>
                                <GoogleIcon/>
                            </IconButton>*/
                        },
                        /*
                                                {
                                                    name: 'twitter',
                                                    ReplaceComponent: () => <IconButton
                                                        onClick={() => window.location.href = `${process.env.PUBLIC_URL}/auth/twitter`}>
                                                        <TwitterIcon/>
                                                    </IconButton>,
                                                    hidden: true,
                                                }
                        */
                    ],
                    {
                        name: 'profile',
                        label: profile?.email,
                        hidden: !!profile
                    },
                    {
                        name: 'translate',
                        ReplaceComponent: () => <ToggleTranslate/>
                    },

                ] as ArrayToTreeParams<TreeMenuNode>
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