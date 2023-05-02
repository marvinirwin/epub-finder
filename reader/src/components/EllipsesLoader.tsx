import React, { useState, useEffect } from 'react';

const Ellipsis: React.FC = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDots((dots) => {
                if (dots === '...') {
                    return '';
                }
                return dots + '.';
            });
        }, 500);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return <h4>{dots}</h4>;
};

interface Props {
    items: string[];
}

const DisplayList: React.FC<Props> = ({ items }) => {
    const displayText = `${items.join(', ')}`;
    return (
        displayText ?
        <div className="text-white font-medium text-sm px-5 py-2.5 text-center mr-2 inline-flex items-center">
            <h4>{displayText}</h4>
            <Ellipsis />
        </div> : null
    );
};

export default DisplayList;