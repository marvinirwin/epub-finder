import { ReplaySubject } from 'rxjs'
import { BrowserInputsService } from '../hotkeys/browser-inputs-service'
import { GeneralToastMessageService } from './general-toast-message.service'
import { distinctUntilChanged,  withLatestFrom } from 'rxjs/operators'
import { LanguageConfigsService } from '../language/language-configs.service'
import { fetchTranslation } from '../../services/translate.service'
import React from 'react'
import { Box, Typography } from '@material-ui/core'

export class OnSelectService {
    selectedText$ = new ReplaySubject<string | undefined>(1)
    browserInputsService: BrowserInputsService
    private generalToastMessageService: GeneralToastMessageService

    constructor({
        browserInputsService,
        generalToastMessageService,
        languageConfigsService,
    }: {
        browserInputsService: BrowserInputsService
        generalToastMessageService: GeneralToastMessageService
        languageConfigsService: LanguageConfigsService
    }) {
        this.browserInputsService = browserInputsService
        this.generalToastMessageService = generalToastMessageService
        this.selectedText$
            .pipe(
                distinctUntilChanged(),
                withLatestFrom(
                    languageConfigsService.learningToKnownTranslateConfig$,
                ),
            )
            .subscribe(async ([str, translateConfig]) => {
                if (str && translateConfig) {
                    const translation = await fetchTranslation({
                        ...translateConfig,
                        text: str,
                    })
                    this.generalToastMessageService.addToastMessage$.next(
                        () => {
                            return (
                                <Box m={2} p={1}>
                                    <Typography variant={'h4'}>{str}</Typography>
                                    <br/>
                                    <Typography variant={'h6'}>{translation}</Typography>
                                </Box>
                            )
                        },
                    )
                }
            })
        this.handleSelection(document)
    }

    handleSelection(document: HTMLDocument) {
        const checkForSelectedText = () => {
            const activeEl = document.activeElement
            if (activeEl) {
                const selObj = document.getSelection()
                if (selObj) {
                    const text = selObj.toString()
                    if (text) {
                        this.selectedText$.next(text)
                    }
                    return
                }
            }
        }
        this.browserInputsService
            .getKeyUpSubject('Shift')
            .subscribe(checkForSelectedText)
    }
}
