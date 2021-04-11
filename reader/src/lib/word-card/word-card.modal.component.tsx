import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { WordInformationComponent } from '../../components/word-information/word-information.component'

export const WordCardDisplay = () => {
    const m = useContext(ManagerContext)
    const wordCard = m.wordCardModalService.wordCard$
    return <WordInformationComponent wordCard={wordCard} />
}
