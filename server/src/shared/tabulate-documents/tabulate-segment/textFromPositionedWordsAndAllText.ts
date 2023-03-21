import {IPositionedWord} from "../../annotation/IPositionedWord";

export const textFromPositionedWordsAndAllText = (allText: string, positionedWords: IPositionedWord[]): string => {
    const startPoint = Math.min(...positionedWords.map(({position}) => position));
    const endPoint = Math.min(...positionedWords.map(({position, word}) => position + word.length));
    return allText.substr(startPoint, endPoint);
};