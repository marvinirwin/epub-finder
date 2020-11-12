import {constructTree, ds_Tree} from "./tree.service";
import {TreeMenuNode} from "./tree-menu.service";
import {MenuitemInterface} from "../components/DrawerMenu/SelectableMenuList";
import React from "react";
import {Manager} from "../lib/Manager";
import {Reading} from "../components/Reading/Reading";
import {Library} from "../components/Library/Library";


export const AppDirectoryService = (m: Manager) => {
    const HotkeyScreen = () => <div>Hotkey</div>;

    const menuNodeFactory = (
        Component: React.FunctionComponent<any>,
        label: string,
        key: string
    ): TreeMenuNode<MenuitemInterface, any> => ({
        Component,
        value: {
            label,
            key
        },
        name: label
    })
    const main = menuNodeFactory(() => <Reading m={m}/>, 'reading', 'reading');
    const library = menuNodeFactory(() => <Library m={m}/>, 'library', 'library');
    const hotkey = menuNodeFactory(HotkeyScreen, 'hotkey', 'hotkey')

    return constructTree<TreeMenuNode<MenuitemInterface, any>>([
        'root',
        main,
        [
            [
                'library',
                library,
                []
            ],
            [
                'hotkey',
                hotkey,
                []
            ]
        ]
    ]);
}