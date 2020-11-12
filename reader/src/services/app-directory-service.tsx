import {constructTree, ds_Tree} from "./tree.service";
import React from "react";
import {Manager} from "../lib/Manager";
import {Reading} from "../components/Reading/Reading";
import {Library} from "../components/Library/Library";
import {SignIn} from "../components/Authentication/SignIn";
import {SignUp} from "../components/Authentication/SignUp";
import {TreeMenuNode} from "./tree-menu-node.interface";


export const AppDirectoryService = (m: Manager) => {
    const HotkeyScreen = () => <div>Hotkey</div>;

    const menuNodeFactory = (
        Component: React.FunctionComponent<{}>,
        label: string,
        key: string,
        moveDirectory: boolean,
        leftIcon?: string,
    ): TreeMenuNode<any, any> => ({
        Component,
        value: {},
        name: label,
        label,
        key,
        leftIcon,
        moveDirectory
    })
    const ReadingComponent = () => <Reading m={m}/>;
    const main = menuNodeFactory(ReadingComponent, 'main', 'main', false);
    const library = menuNodeFactory(() => <Library m={m}/>, 'library', 'library', false);
    const hotkey = menuNodeFactory(HotkeyScreen, 'hotkey', 'hotkey', false)
    const reading = menuNodeFactory(ReadingComponent, 'reading', 'reading', true);
    const signIn = menuNodeFactory(() => <SignIn/> ,'sign-in', 'sign-in', true);
    const signUp = menuNodeFactory(() => <SignUp/> ,'sign-up', 'sign-up', true);

    return constructTree<TreeMenuNode<any, any>>([
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