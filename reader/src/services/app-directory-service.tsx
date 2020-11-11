import {constructTree, ds_Tree} from "./tree.service";
import {TreeMenuNode} from "./tree-menu.service";
import {MenuitemInterface} from "../components/DrawerMenu/SelectableMenuList";
import React from "react";
import {Manager} from "../lib/Manager";
import {Reading} from "../components/Pages/Reading";


export const AppDirectoryService = (m: Manager) => {
    const MainScreen = () => <div>Main</div>
    const LibraryScreen = () => <div>Library</div>;
    const HotkeyScreen = () => <div>Hotkey</div>;

    const main: TreeMenuNode<MenuitemInterface, any> = {
        Component: () => <Reading m={m}/>,
        value: {
            label: 'reading',
            key: 'reading'
        },
        name: 'reading'
    };

    const library = {
        Component: LibraryScreen,
        value: {
            label: 'library',
            key: 'library',
        },
        name: 'library'
    };

    const hotkey = {
        Component: HotkeyScreen,
        value: {
            label: 'hotkey',
            key: 'hotkey',
        },
        name: 'hotkey'
    };

    return constructTree<TreeMenuNode<MenuitemInterface, any>>([
        'root',
        main,
        [
            [
                'library',
                library,
                [
                    [
                        'hotkey',
                        hotkey,
                        []
                    ]
                ]
            ],
            [
                'hotkey',
                hotkey,
                [
                    [
                        'library',
                        library,
                        []
                    ]
                ]
            ]
        ]
    ]);
}