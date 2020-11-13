import {constructTree, ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager} from "../../lib/Manager";
import {Reading} from "../Reading/Reading";
import {Library} from "../Library/Library";
import {SignIn} from "../Authentication/SignIn";
import {SignUp} from "../Authentication/SignUp";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {hotkeyMode} from "../../lib/Hotkeys/BrowserInputs";
import {HotkeyMenuTree} from "./hotkey-directory.service";
import {LibraryDirectoryService} from "./library-directory.service";

export const menuNodeFactory = (
    Component: React.FunctionComponent<{}> | undefined,
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

            const signIn = menuNodeFactory(() => <SignIn/>, 'sign-in', 'sign-in', true);
            const signUp = menuNodeFactory(() => <SignUp/>, 'sign-up', 'sign-up', true);

            const rootTree = constructTree('root', main);
            rootTree.children = {
                reading: constructTree('reading', reading),
                signIn: constructTree('sign-in', signIn),
                library: LibraryDirectoryService(m, checkedOutBooks, {...customBooks, ...builtInBooks}),
                hotkeys: HotkeyMenuTree(m)
            };
            return rootTree;
        })
    )
}