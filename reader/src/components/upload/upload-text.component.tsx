import React, { useContext, useState } from 'react'
import { ManagerContext } from '../../App'
import { Box, Button, TextField, Typography } from '@material-ui/core'
import { uploadTextArea, uploadTextButton, uploadTextName } from 'languagetrainer-server/src/shared'
import { useObservableState } from 'observable-hooks'

export const UploadText = () => {
    const m = useContext(ManagerContext)
    const [text, setText] = useState<string>('')
    const [title, setTitle] = useState<string>('')
    const language_code = useObservableState(m.languageConfigsService.readingLanguageCode$)
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
                <Box style={{ display: 'inline-block' }}>
                    <Button
                        disabled={(!text.trim() || !title.trim())}
                        onClick={() => {
                            if (language_code && !!text.trim() && !!title.trim()) {
                                m.uploadingDocumentsService.upload({
                                    language_code,
                                    file: new File([text], `${title}.txt`),
                                })
                            }
                            setTitle('')
                            setText('')
                        }}
                        id={uploadTextButton}
                    >
                        <Typography variant={'h4'}>Add </Typography>
                    </Button></Box>
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
            {/*
            <Box m={2} p={1}>
                {' '}
            </Box>{' '}
*/}
        </Box>
    )
}
