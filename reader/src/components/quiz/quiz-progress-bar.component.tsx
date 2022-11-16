import React, {useState, useEffect} from 'react';

export type QuizProgressBarProps = {
    progressBarPercentage: number
}

export const QuizProgressBar: React.FC<QuizProgressBarProps> = ({
    progressBarPercentage,
}) => {
    const [progressPercentage, setProgressPercentage] = useState(0);

    useEffect(() => {
        setProgressPercentage(progressBarPercentage);
    }, [progressBarPercentage]);

    return (
        <div className="w-full bg-[#9CA3AF] relative rounded-md my-5">
            <div className={`h-8 bg-[#059669] rounded-md`} style={{width: `${progressPercentage}%`}} />
        </div>
    );
}