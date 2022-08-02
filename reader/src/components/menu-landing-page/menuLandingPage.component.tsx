import React, {useState, useEffect} from 'react';

//https://dummyimage.com/640x360/fff/aaa

type Language = {
    value: string,
    name: string,
    variants?: Language[]
}

export type MenuLandingPageProps = {
    languages: Language[],
    onLanguageSelect: any,
    onVariantSelect: any
}

export const MenuLandingPage: React.FC<MenuLandingPageProps> = ({languages, onLanguageSelect, onVariantSelect}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [language, setLanguage] = useState<Language | undefined>(undefined);
    const [variant, setVariant] = useState<Language | undefined>(undefined);

    useEffect(() => {
        if (languages.length) {
            const lang = languages[0];
            setLanguage(lang);
            if (lang.variants?.length) {
                setVariant(lang.variants[0]);
            }
        }
    }, [languages]);

    const handleLanguageChange = (event: any) => {
        const selectedLang = languages.find(lang => lang.value === event.target.value);
        setLanguage(selectedLang);
        onLanguageSelect(selectedLang);
    }

    const handleVariantChange = (event: any) => {
        if (language?.variants) {
            const selectedVariant = language.variants.find(lang => lang.value === event.target.value);
            setVariant(selectedVariant);
            onVariantSelect(selectedVariant);
        }
    }

    return (
        <div className='w-full h-full relative'>
            <nav className='flex justify-end items-center relative w-full h-[70px]'>
                {showSettings ? (
                    <div>
                        <input />
                        <select></select>
                    </div>
                ) : (
                    <div className='mx-5 w-10 h-10 rounded-full bg-[#D9D9D9] flex justify-center items-center' onClick={() => setShowSettings(true)}>
                        <span>M</span>
                    </div>
                )}
            </nav>
            <div className='w-full h-full flex flex-row'>      
                <div className='flex flex-col w-1/2'>
                    <h1 className='text-6xl'>Learn all the words</h1>
                    <h1 className='text-6xl'>from a restaurant menu</h1>
                    <img src="https://i.kfs.io/album/global/160289973,0v1/fit/500x500.jpg" className='w-full' />
                </div>
                <div className='flex flex-col w-1/2 p-5'>
                    <div className='flex flex-col justify-center items-center m-8'>
                        <select className='w-[300px] h-11 mb-[30px] text-1rem text-[#71717A]' defaultValue={languages[0].value} value={language?.value} onChange={handleLanguageChange}>
                            {languages.map(lang => (
                                <option className='text-1rem text-[#71717A]' key={lang.value} value={lang.value}>{lang.name}</option>
                            ))}
                        </select>
                        {variant && (
                            <select className='w-[300px] h-11 text-1rem text-[#71717A]' defaultValue={variant.value} value={variant.value} onChange={handleVariantChange}>
                                {language?.variants?.map(lang => (
                                    <option className='text-1rem text-[#71717A]' key={lang.value} value={lang.value}>{lang.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className='border-2 border-dashed rounded-lg flex-1'>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}


MenuLandingPage.defaultProps = {
    languages: [
        {
            value: 'zh',
            name: 'Chinese',
            variants: [
                {
                    value: 'zh-Hans',
                    name: 'Chinese (Simplified)'
                },
                {
                    value: 'zh-Hant',
                    name: 'Chinese (Traditional)'
                },
            ]
        },
        {
            value: 'en',
            name: 'English',
            variants: [
                {
                    value: 'en-CA',
                    name: 'English (CA)'
                },
                {
                    value: 'en-US',
                    name: 'English (US)'
                }
            ]
        },
    ],
    onLanguageSelect: () => {},
    onVariantSelect: () => {}
}