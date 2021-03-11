import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {QuizCard} from "../../components/quiz/word-card.interface";
import {useObservableState} from "observable-hooks";
import {FrequencyDocument} from "../frequency-documents";
import {
    frequencyDocumentProgress,
    frequencyDocumentProgressPrefix, recognizedCount,
    somewhatRecognizedCount,
    unrecognizedCount,
} from "@shared/";
import {Paper} from "@material-ui/core";

export const QuizCardProgress = ({quizCard}: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext);
    const frequencyDocuments = [...(useObservableState(m.frequencyDocumentsRepository.selected$) || new Map()).values()];
    // Now list them
    return <div>
        {
            frequencyDocuments.map((frequencyDocument: FrequencyDocument) => <FrequencyDocumentInfo
                key={frequencyDocument.frequencyDocument.id()}
                frequencyDocument={frequencyDocument}
            />)
        }
    </div>
}

export const FrequencyDocumentInfo = ({frequencyDocument}: { frequencyDocument: FrequencyDocument }) => {
    const progress = useObservableState(frequencyDocument.progress$)
    return <Paper
        className={frequencyDocumentProgress}
        id={`${frequencyDocumentProgressPrefix}${frequencyDocument.frequencyDocument.name}`}>
        {
            progress && <Fragment>
                <div>{frequencyDocument.frequencyDocument.name}</div>
                <div>Unrecognized: <span
                    className={unrecognizedCount}>{progress.readabilityState.unrecognized.length}</span></div>
                <div>Somewhat Recognized: <span
                    className={somewhatRecognizedCount}>{progress.readabilityState.somewhatRecognized.length}</span>
                </div>
                <div>Recognized: <span
                    className={recognizedCount}>{progress.readabilityState.fullRecognition.length}</span></div>
            </Fragment>
        }
    </Paper>
}
