import React from 'react';

export type CardData = {
    romanizationTitle: string,
    knownLanguage: string,
    dictionaryDefinition: string,
    sound: any
}

export type RevealedQuizCardProps = {
    progressBarPercentage: number,
    exampleSentences: string[],
    cardInfo: CardData
}

export const RevealedQuizCard: React.FC<RevealedQuizCardProps> = ({progressBarPercentage, exampleSentences, cardInfo}) => {
    return (
        <div className='flex flex-col'>
            {showSettings && (
            <div
                className="absolute top-0 left-0 w-full h-full z-10 bg-[rgba(0,0,0,0.5)]"
                onClick={() => setShowSettings(false)}
                />
            )}
            <nav className="flex justify-end items-center relative w-full h-[70px]">
                {showSettings ? (
                <SettingsPopup
                    show={showSettings}
                    languages={languages}
                    onLanguageSelect={handleLanguageChange}
                    onVariantSelect={handleVariantChange}
                />
                ) : (
                <div
                    className="mx-5 w-10 h-10 rounded-full bg-[#D9D9D9] flex justify-center items-center"
                    onClick={() => setShowSettings(true)}
                >
                    <span>M</span>
                </div>
                )}
            </nav>
            <div></div>
            <div>
                <div>
                    <div></div>
                    <div></div>
                    <div>
                        <div></div>
                        <button></button>
                        <div>
                            <div>Easy</div>
                            <div>Medium</div>
                            <div>Hard</div>
                            <div>Known</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}