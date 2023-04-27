import {classNames} from "./ClassNames";
import React from "react";

export function NavBarProfileSettingsLink(props: { active: boolean }) {
    return <a
        href="#"
        className={classNames(props.active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}
    >
        Settings
    </a>;
}