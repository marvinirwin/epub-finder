import React from "react";
import {Edit} from '@material-ui/icons'

export const EditableOnClick: React.FC<{onEditClicked: () => void}> = ({children, onEditClicked}) => {
    return <div className='editable-on-click'>
        <div className='editable-on-click-edit-container'>
            <Edit/>
        </div>
        {children}
    </div>
}