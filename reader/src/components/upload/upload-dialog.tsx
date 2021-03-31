import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { UploadText } from './upload-text.component'
import { Box, Button, Typography } from '@material-ui/core'
import { fileChooser, uploadProgressBar } from '@shared/'
import { BorderLinearProgressComponent } from '../progress/border-linear-progress.component'

export const UploadDialog = () => {
    const m = useContext(ManagerContext)
    const currentFile = useObservableState(
        m.uploadingDocumentsService.currentUploadingFile$,
    )
    return (
        <Box m={2} p={1} style={{width: '90vw', height: '90vh'}}>
            <Typography variant={'h5'} color="textSecondary" gutterBottom>
                Use text as learning material
            </Typography>
            <UploadText />
            <div>
                <Typography variant={'h5'} color="textSecondary" gutterBottom>
                    Upload Learning Material
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '24px' }}>
                    Supported Extensions: docx, txt, pdf and html
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '24px' }}>
                    Max Size: 1MB
                </Typography>
                <div className="mg20">
                    {currentFile && (
                        <Box
                            className={`mb25 ${uploadProgressBar}`}
                            display="flex"
                            alignItems="center"
                        >
                            <Box width="100%" mr={1}>
                                <BorderLinearProgressComponent />
                            </Box>
                        </Box>
                    )}

                    <label htmlFor="btn-upload">
                        <input
                            id={fileChooser}
                            name="btn-upload"
                            style={{ display: 'none' }}
                            type="file"
                            onChange={(e) => {
                                const droppedFiles = e.target.files
                                if (droppedFiles) {
                                    m.droppedFilesService.uploadFileRequests$.next(
                                        [...droppedFiles],
                                    )
                                }
                            }}
                        />
                        <Button
                            className="btn-choose"
                            variant="outlined"
                            component="span"
                        >
                            Upload a txt, pdf or html file
                        </Button>
                    </label>
                </div>
            </div>
        </Box>
    )
}
