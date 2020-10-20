import React from "react"

export const LoginOptions: React.FunctionComponent<{options: {[key: string]: string}}> = ({options}) => {
    return <ul>
        {Object.entries(options).map(([key, url]) => <li key={key}><a href={url}>Login with {url}</a></li>)}
    </ul>
}