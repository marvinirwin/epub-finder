import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {QuizCard} from "../../components/quiz/quiz-card.interface";
import {useObservableState} from "observable-hooks";
import {FrequencyDocument} from "../frequency-documents";
import {
    frequencyDocumentProgress,
    frequencyDocumentProgressPrefix, recognizedCount,
    somewhatRecognizedCount,
    unrecognizedCount,
} from "@shared/";

export const QuizCardProgress = ({quizCard}: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext);
    const frequencyDocuments = [...(useObservableState(m.frequencyDocumentsRepository.all$) || new Map()).values()];
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
    return <div>
        {
            progress && <div
                className={frequencyDocumentProgress}
                id={`${frequencyDocumentProgressPrefix}${frequencyDocument.frequencyDocument.name}`
                }>
                <div>{frequencyDocument.frequencyDocument.name}</div>
                <div>Unrecognized: <span className={unrecognizedCount}>{progress.readabilityState.unrecognized}</span></div>
                <div>Somewhat Recognized: <span className={somewhatRecognizedCount}>{progress.readabilityState.somewhatRecognized}</span></div>
                <div>Recognized: <span className={recognizedCount}>{progress.readabilityState.fullRecognition}</span></div>
            </div>}
    </div>
}
