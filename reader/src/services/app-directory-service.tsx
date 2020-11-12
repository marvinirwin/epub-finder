import {constructTree, ds_Tree} from "./tree.service";
import React from "react";
import {Manager} from "../lib/Manager";
import {Reading} from "../components/Reading/Reading";
import {Library} from "../components/Library/Library";
import {SignIn} from "../components/Authentication/SignIn";
import {SignUp} from "../components/Authentication/SignUp";
import {TreeMenuNode} from "./tree-menu-node.interface";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";


export const AppDirectoryService = (m: Manager): Observable<ds_Tree<TreeMenuNode<any, any>>> => {
    // This is going to break the way I do "Selected components".
    // I should do selected components by path, that way their refs can change?
    // Also I gotta make sure all my values are unique in that loop
    const HotkeyScreen = () => <div>Hotkey</div>;
    return combineLatest([
        m.openedBooks.checkedOutBooks$
    ]).pipe(
        map(([checkedOutBooks]) => {
            const menuNodeFactory = (
                Component: React.FunctionComponent<{}> | undefined,
                label: string,
                key: string,
                moveDirectory: boolean,
                leftIcon?: string,
                inlineComponent?: React.FunctionComponent,
                action?: () => void
            ): TreeMenuNode<any, any> => ({
                Component,
                value: {},
                name: key,
                label,
                key,
                leftIcon,
                moveDirectory,
                action
            });
            const ReadingComponent = () => <Reading m={m}/>;
            const main = menuNodeFactory(ReadingComponent, 'Reading', 'root', false);
            const reading = menuNodeFactory(ReadingComponent, 'Reading', 'reading', true);
            const getNewBooks = menuNodeFactory(() => <Library m={m}/>, 'Get new books', 'get-new-books', false);
            const library = menuNodeFactory(undefined, 'Library', 'library', true);
            const checkedOutBooksSelection = Object.keys(checkedOutBooks).map(
                checkedOutBook => menuNodeFactory(
                    undefined,
                    checkedOutBook,
                    checkedOutBook,
                    false,
                    undefined,
                    undefined,
                    () => m.openedBooks.checkedOutBooks$
                    )
            );

            const hotkey = menuNodeFactory(HotkeyScreen, 'hotkey', 'hotkey', false)
            const signIn = menuNodeFactory(() => <SignIn/>, 'sign-in', 'sign-in', true);
            const signUp = menuNodeFactory(() => <SignUp/>, 'sign-up', 'sign-up', true);

            return constructTree<TreeMenuNode<any, any>>(
                'root',
                main,
                [
                    'reading',
                    reading,
                ],
                [
                    'sign-in',
                    signIn,
                ],
                [
                    'sign-up',
                    signUp,
                ],
                [
                    'library',
                    library,
                ],
                [
                    'hotkey',
                    hotkey,
                ],
            );
        })
    )
}