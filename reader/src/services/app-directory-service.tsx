import {constructTree, ds_Tree} from "./tree.service";
import {TreeMenuNode} from "./tree-menu.service";
import React from "react";
import {Manager} from "../lib/Manager";
import {Reading} from "../components/Reading/Reading";
import {Library} from "../components/Library/Library";
import {MenuitemInterface} from "../components/DrawerMenu/menu-item.interface";
import {SignIn} from "../components/Authentication/SignIn";
import {SignUp} from "../components/Authentication/SignUp";


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
    const ReadingComponent = () => <Reading m={m}/>;
    const main = menuNodeFactory(ReadingComponent, 'main', 'main');
    const library = menuNodeFactory(() => <Library m={m}/>, 'library', 'library');
    const hotkey = menuNodeFactory(HotkeyScreen, 'hotkey', 'hotkey')
    const reading = menuNodeFactory(ReadingComponent, 'reading', 'reading');
    const signIn = menuNodeFactory(() => <SignIn/> ,'sign-in', 'sign-in');
    const signUp = menuNodeFactory(() => <SignUp/> ,'sign-up', 'sign-up');

    return constructTree<TreeMenuNode<MenuitemInterface, any>>([
        'root',
        main,
        [
            [
                'reading',
                reading,
                []
            ],
            [
                'sign-in',
                signIn,
                []
            ],
            [
                'sign-up',
                signUp,
                []
            ],
            [
                'library',
                library,
                []
            ],
            [
                'hotkey',
                hotkey,
                []
            ],
        ]
    ]);
}