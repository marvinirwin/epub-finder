import React from 'react'
import PopupState, { bindMenu, bindTrigger, bindHover } from 'material-ui-popup-state'
import HoverMenu from 'material-ui-popup-state/HoverMenu'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import { Button, Menu, MenuItem } from '@material-ui/core'

export const WrapInContext: React.FC<{
    items: string[],
    onClick: (v: string) => unknown,
}> = ({
          children,
          items,
          onClick,
      }) => {
    return <PopupState variant='popover' >
        {(popupState) => (
            <React.Fragment>
                <Button variant='outlined'  {...bindTrigger(popupState)}>
                    {children}
                </Button>
                <Menu {...bindMenu(popupState)}>
                    {
                        items.map(item => <MenuItem key={item} onClick={() => {
                            popupState.close()
                            onClick(item)
                        }}>{item}</MenuItem>)
                    }
                </Menu>
            </React.Fragment>
        )}
    </PopupState>
}