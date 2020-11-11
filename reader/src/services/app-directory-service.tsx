import {constructTree, ds_Tree} from "./tree.service";
import {TreeMenuNode} from "./tree-menu.service";
import {MenuitemInterface} from "../components/DrawerMenu/SelectableMenuList";
import React from "react";


export const AppDirectoryService = () => {
    const MainScreen = () => <div>Main</div>
    const LibraryScreen = () => <div>Library</div>;
    const HotkeyScreen = () => <div>Hotkey</div>;

    const main: TreeMenuNode<MenuitemInterface, any> = {
        Component: MainScreen,
        value: {
            label: 'main',
            key: 'main'
        },
        name: 'main'
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