import { TreeMenuNode } from '../tree-menu-node.interface'
import { Manager } from '../../../lib/manager/Manager'
import { RecordRequest } from '../../../lib/util/RecordRequest'
import { removePunctuation } from '../../../lib/highlighting/temporary-highlight.service'
import React, { useContext } from 'react'
import { ManagerContext } from '../../../App'
import { useObservableState } from 'observable-hooks'
import { RecordVoiceOver } from '@material-ui/icons'
import { RECOGNIZE_SPEECH } from 'languagetrainer-server/src/shared'
import { observableLastValue } from '../../../services/settings.service'
import { TutorialPopper } from '../../tutorial-popover/tutorial-popper.component'
import { Typography } from '@material-ui/core'

export function RecognizeSpeechNode(m: Manager): TreeMenuNode {
    return {
        name: RECOGNIZE_SPEECH,
        LeftIcon: () => {
            const manager = useContext(ManagerContext)
            const isRecording = useObservableState(
                manager.audioRecordingService.audioRecorder.isRecording$,
            )
            const trySpeakingRef = useObservableState(m.introService.trySpeakingRef$)
            return <>
                <RecordVoiceOver color={isRecording ? 'primary' : 'disabled'} />
                {trySpeakingRef && <TutorialPopper storageKey={'recognize-speech'} referenceElement={trySpeakingRef}>
                    <Typography>Click this to test your pronunciation with speech recognition</Typography>
                </TutorialPopper>
                }
            </>
        },
        label: 'Speak',
        action: async () => {
            const currentLanguageCode = await observableLastValue(
                m.languageConfigsService.readingLanguageCode$,
            )
            const recordRequest = new RecordRequest(
                `Try reading one of the sentences below`,
            )
            recordRequest.sentence.then((recognizedSentence) => {
                const word = removePunctuation(recognizedSentence)
                m.pronunciationProgressService.addRecords$.next([
                    {
                        word,
                        success: true,
                        created_at: new Date(),
                        language_code: currentLanguageCode,
                    },
                ])
                // Add a highlight for each of these characters
                m.highlighter.createdCards$.next(word.split(' '))
            })
            m.audioRecordingService.audioRecorder.recordRequest$.next(
                recordRequest,
            )
        },

        props: {
            ref: (ref) => {
                m.introService.trySpeakingRef$.next(ref)
            },
        },
    }
}
