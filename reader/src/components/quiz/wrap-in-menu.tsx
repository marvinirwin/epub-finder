import React from 'react'
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'
import { Button, Menu, MenuItem } from '@material-ui/core'

export const WrapInContext: React.FC<{
    items: string[],
    onClick: (v: string) => unknown,
}> = ({
          children,
          items,
          onClick,
      }) => {
    return <PopupState variant='popover' popupId='demo-popup-menu'>
        {(popupState) => (
            <React.Fragment>
                {children}
                <Button variant='contained' color='primary' {...bindTrigger(popupState)}>
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