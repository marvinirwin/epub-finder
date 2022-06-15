import React, { useContext, useMemo } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { UploadText } from './upload-text.component'
import { Box, Button, Typography } from '@material-ui/core'
import { fileChooser, uploadProgressBar } from '@shared/'
import { BorderLinearProgressComponent } from '../progress/border-linear-progress.component'
import { languageCodesMappedToLabels } from '../../../../server/src/shared/supported-translation.service'
import { useVisibleObservableState } from "../UseVisilbleObservableState/UseVisibleObservableState";
import { EmittedValues } from "../UseVisilbleObservableState/EmittedValues.component";

export const UploadDialog = () => {
    const m = useContext(ManagerContext)
    const currentFile = useObservableState(
        m.uploadingDocumentsService.currentUploadingFile$,
    );
    const language_code = useObservableState(m.languageConfigsService.readingLanguageCode$);
    const currentLanguageLabel = languageCodesMappedToLabels.get(language_code || '') || '';

    const emittedSelectedReadingLanguages = useVisibleObservableState(m.settingsService.readingLanguage$, (str: string) => `m.settingsService.readingLanguage$: ${str}`);
    const emittedCurrentUploadingFiles = useVisibleObservableState(m.uploadingDocumentsService.currentUploadingFile$, (file: File | undefined) => `m.uploadingDocumentsService.currentUploadingFile$: ${file?.name}`);

    const allEmittedValues = useMemo(() => [...emittedSelectedReadingLanguages, ...emittedCurrentUploadingFiles], [emittedSelectedReadingLanguages, emittedCurrentUploadingFiles]);

    return (
        <Box m={2} p={1} style={{width: '90vw', height: '90vh'}}>
            <EmittedValues emittedValues={allEmittedValues}  />
            <Typography variant={'h5'} color="textSecondary" gutterBottom>
                Copy and paste some text you'd like to read in <Button onClick={() => m.modalService.languageSelect.open$.next(true)}><Typography variant={'h5'} color="textSecondary">{currentLanguageLabel}</Typography></Button>
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
                                if (droppedFiles && language_code) {
                                    for (let i = 0; i < droppedFiles.length; i++) {
                                        const file = droppedFiles[i]
                                        m.uploadingDocumentsService.upload( {file, language_code})
                                    }
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

