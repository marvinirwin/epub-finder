import { InputBase, styled } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import { Search } from '@material-ui/icons'
import React, { useContext, useState } from 'react'
import { ManagerContext } from '../../App'

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
/*
            '&:focus': {
                width: '20ch',
            },
*/
        },
    },
}))

export const WordSearch = () => {
    const [wordSearchInputValue, setWordSearchInputValue] = useState('')
    const m = useContext(ManagerContext)
    return <>
        <StyledInputBase
            value={wordSearchInputValue}
            placeholder='Search Words'
            onKeyDown={k => {
                if (k.key === 'Enter') {
                    m.wordCardModalService.word$.next(wordSearchInputValue)
                }
            }}
            onChange={v => {
                setWordSearchInputValue(v.target.value)
            }} />
        <IconButton onClick={() => m.wordCardModalService.word$.next(wordSearchInputValue)}>
            <Search style={{color: 'white'}}/>
        </IconButton>
    </>
}