import React from "react";

export function NavBarFullScreenNavItems(props: { elements: JSX.Element[] }) {
    return <div className="hidden sm:block sm:ml-6">
        <div className="flex space-x-4">
            {props.elements}
        </div>
    </div>;
}