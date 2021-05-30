import { TextField } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import { Search } from '@material-ui/icons'
import React, { Fragment, useContext, useState } from 'react'
import { ManagerContext } from '../../App'

export const WordSearch = () => {
    const [wordSearchInputValue, setWordSearchInputValue] = useState('')
    const m = useContext(ManagerContext);
    return <Fragment>
        <TextField
        style={{ marginLeft: '24px', marginRight: '24px' }}
        value={wordSearchInputValue}
        placeholder='Look up a word'
        variant='filled'
        onKeyDown={k => {
            if (k.key === 'Enter') {
                m.wordCardModalService.word$.next(wordSearchInputValue)
            }
        }}
        onChange={v => {
            setWordSearchInputValue(v.target.value)
        }}
    />
        <IconButton onClick={() => m.wordCardModalService.word$.next(wordSearchInputValue)}>
            <Search />
        </IconButton>
    </Fragment>
}