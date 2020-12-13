import {Manager} from "../../lib/Manager";
import {ds_Tree} from "../../services/tree.service";
import {checkoutBook, returnBook} from "../Library/library.module";
import {ds_Dict} from "../../lib/Tree/DeltaScanner";
import DeleteIcon from '@material-ui/icons/Delete';
import NoteAdd from '@material-ui/icons/NoteAdd';
import React from "react";
import {TreeMenuNode} from "./tree-menu-node.interface";

export const bookMenuNodeFactory = (
    m: Manager,
    name: string,
    checkedOut: boolean
): TreeMenuNode => ({
    name: name,
    label: name,
    LeftIcon: checkedOut ? () => <DeleteIcon/> : () => <NoteAdd/>,
    action: () => checkedOut ? returnBook(m, name) : checkoutBook(m, name)
})


export const LibraryDirectoryService = (
    m: Manager,
    checkedOutBooks: ds_Dict<boolean>,
    availableBooks: ds_Dict<any>
): ds_Tree<TreeMenuNode> => {
    const makeTreeForMenuNode = (checkedOut: boolean) => (checkedOutTitle: string) => {
        const treeMenuNode = bookMenuNodeFactory(m, checkedOutTitle, checkedOut)
        return [
            treeMenuNode.name,
            {
                nodeLabel: treeMenuNode.label,
                value: treeMenuNode
            }
        ];
    }

    return {
        nodeLabel: 'library',
        value: {
            name: 'library',
            label: 'Library',
            moveDirectory: true
        },
        children: Object.fromEntries(
            [
                ...Object.keys(checkedOutBooks)
                    .map(makeTreeForMenuNode(true)),
                ...Object.keys(availableBooks)
                    .filter(title => !checkedOutBooks[title])
                        .map(makeTreeForMenuNode(false))
            ]
        )
    }
}