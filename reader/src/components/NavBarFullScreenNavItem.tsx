import {TreeMenuNode} from "./app-directory/tree-menu-node.interface";
import {NavLink, useLocation} from "react-router-dom";
import React from "react";

export function NavBarFullScreenNavItem(props: {
    item: TreeMenuNode,
    className: (
        {
            isActive,
            isPending
        }: { isActive: any; isPending: any }) => string
}) {
    const location = useLocation();
    return <NavLink
        to={{
            pathname: props.item.pathname || props.item.name,
            search: location.search
        }}
        className={props.className
        }
    >
        {props.item.label}
    </NavLink>;
}