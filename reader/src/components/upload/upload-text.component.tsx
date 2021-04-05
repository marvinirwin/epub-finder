import React, { useContext, useState } from 'react'
import { ManagerContext } from '../../App'
import { Box, Button, TextField, Typography } from '@material-ui/core'
import { uploadTextArea, uploadTextButton, uploadTextName } from '@shared/'
import { useObservableState } from 'observable-hooks'

export const UploadText = () => {
    const m = useContext(ManagerContext)
    const [text, setText] = useState<string>('')
    const [title, setTitle] = useState<string>('');
    const languageCode = useObservableState(m.languageConfigsService.readingLanguageCode$)
    return (
        <Box m={2} style={{ display: 'flex', flexFlow: 'column nowrap' }}>
            <Box m={2} p={1}>
                <TextField
                    label={'Label'}
                    value={title}
                    onChange={(v) => setTitle(v.target.value || '')}
                    placeholder={'Label'}
                    variant={'filled'}
                    inputProps={{ id: uploadTextName }}
                />
            </Box>
            <Box m={2} p={1} style={{ width: '100%' }}>
                <TextField
                    variant={'filled'}
                    style={{ width: '100%' }}
                    multiline
                    rows={10}
                    onChange={(v) => setText(v.target.value || '')}
                    value={text}
                    label={'Learning Material'}
                    placeholder={'Learning Material'}
                    id={uploadTextArea}
                />
            </Box>
            <Box m={2} p={1}>
                {' '}
                <Button
                    color={'primary'}
                    variant={'contained'}
                    onClick={() => {
                        if (languageCode && !!text.trim()) {
                            m.uploadingDocumentsService.upload({
                                languageCode,
                                file: new File([text], `${title}.txt`),
                            });
                        }
                        setTitle('')
                        setText('')
                    }}
                    id={uploadTextButton}
                >
                    Use as Learning Material
                </Button>
            </Box>{' '}
        </Box>
    )
}
