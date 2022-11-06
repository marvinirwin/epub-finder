import React from 'react';
import { QuizProgressBar } from '../../quiz-progress-bar.component';

type AnswerOption = {
    id: number,
    label: string
}

export type MultipleChoiceQuizCardProps = {
    progressBarPercentage: number;
    quizScore: number,
    word: string,
    answerOptions: AnswerOption[],
    handleOptionClick: (option: any) => void
}

export const MultipleChoiceQuizCard: React.FC<MultipleChoiceQuizCardProps> = ({
    progressBarPercentage,
    quizScore,
    word,
    answerOptions,
    handleOptionClick
}) => {

    return (
        <div className='w-[720px] h-[460px] relative bg-white p-5'>
            <div className='flex flex-row flex-nowrap items-center'>
                <QuizProgressBar progressBarPercentage={progressBarPercentage} />
                <div className='flex justify-center items-center ml-6 w-24 h-8 rounded-2xl bg-[#D9D9D9]'>
                    <p>{quizScore}</p>
                </div>
            </div>
            <div className='text-[#6B7280] text-lg'>Pick the correct answer</div>
            <div className='text-center font-bold text-xl my-8'>{word}</div>
            <div className='flex flex-row flex-wrap w-full h-[200px] justify-between items-stretch m-auto'>
                {answerOptions.map((option: AnswerOption) => (
                    <div
                        onClick={() => handleOptionClick(option)}
                        className='w-[320px] h-[70px] rounded-xl shadow-[0px_2px_0px_3px_#C6CBD3] flex flex-row items-center justify-between p-4 bg-white hover:bg-slate-200 cursor-pointer'
                    >
                        <div className='flex justify-center items-center w-6 h-6 bg-black rounded-md'>
                            <p className='font-bold text-xs text-white'>{option.id}</p>
                        </div>
                        <p className=''>{option.label}</p>
                        <div aria-hidden className='w-6 h-6'></div>
                    </div>
                ))}
            </div>
        </div>
    );
}