import React, {DragEvent, useContext, useRef} from "react";
import {NavBarAndSettingsPopup} from "../settings-popup/NavBarAndSettingsPopup.component";
import {LandingPage, ParentLanguageOption, VariantLanguageOption} from "./LandingPage";
import {TreeMenuNode} from "../app-directory/tree-menu-node.interface";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {HOME_NODE, LIBRARY_NODE, QUIZ_NODE, SupportedTranslations} from "@shared/";
import {mapTranslatableLanguagesToSpokenOnes} from "../../lib/language/mapTranslatableLanguagesToSpokenOnes";
import {flatten} from "lodash";
import {LibraryNode} from "../app-directory/nodes/library.node";
import {QuizCardCarousel} from "../quiz/quiz-card-carousel.component";
import {QuizCarouselNode} from "../app-directory/nodes/quiz-carousel.node";
import {HomeNode} from "../app-directory/nodes/Home.node";
import {
    createBrowserRouter,
    RouterProvider,
    useLocation,
    useRoutes,
} from "react-router-dom";

export type PageWrapperProps = {};

export const PageWrapper: React.FC<PageWrapperProps> = ({}) => {
    const m = useContext(ManagerContext);
    const readingLanguageCode =
        useObservableState(m.settingsService.readingLanguage$.obs$) || ''
    const spokenLanguageCode =
        useObservableState(m.settingsService.spokenLanguage$.obs$) || ''
    const potentialSpokenLanguageCode =
        useObservableState(m.languageConfigsService.potentialLearningSpoken$) ||
        []
    const potentialTextToSpeech = useObservableState(m.languageConfigsService.potentialLearningLanguageTextToSpeechConfigs$) || []
    const chosenTextToSpeechConfig = useObservableState(m.settingsService.textToSpeechConfiguration$.obs$);
    const currentUserEmail = useObservableState(m.loggedInUserService.profile$)?.email;
    const isLoading = useObservableState(m.loadingService.isLoading$) || false;
    const loadingMessage = useObservableState(m.loadingService.latestLoadingMessage$) || "";

    const languages: ParentLanguageOption[] = SupportedTranslations.map(t => {
            const v = {
                variants: mapTranslatableLanguagesToSpokenOnes(t.code).map(spokenLanguage => ({
                    label: spokenLanguage.label,
                    value: spokenLanguage.code
                })),
                label: t.label,
                value: t.code
            }
            return v as ParentLanguageOption;
        }
    );

    const onFileUpload = async (files: FileList) => {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await m.uploadingDocumentsService.upload({file, language_code: readingLanguageCode});
        }
    }
    const navBarItems: TreeMenuNode[] = [
        HomeNode,
        QuizCarouselNode,
    ];
    const language = languages.find(l => l.value === readingLanguageCode);
    const setLanguage = (v: ParentLanguageOption) => m.settingsService.readingLanguage$.user$.next(v.value);
    const variant = flatten(languages.map(l => l.variants)).find(v => v.value === spokenLanguageCode) as VariantLanguageOption;
    const setVariant = (v: VariantLanguageOption) => m.settingsService.spokenLanguage$.user$.next(v.value)
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const {pathname: currentComponent} = useLocation();

    const handleDrag = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = ({e, filename}: { e: DragEvent, filename: string }) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const uploadedFiles = e.dataTransfer.files;
        if (uploadedFiles.length) {
            onFileUpload(uploadedFiles);
        }
    };

    const handleUploadClick = () => {
        // @ts-ignore
        let el = window._protected_reference = document.createElement("INPUT");
        // @ts-ignore
        el.type = "file";
        // @ts-ignore
        el.accept = "image/*";
        // @ts-ignore
        el.multiple = "multiple"; // remove to have a single file selection

        // (cancel will not trigger 'change')
        el.addEventListener('change', v2 => {
            // @ts-ignore
            onFileUpload(el.files)
            // access el.files[] to do something with it (test its length!)
            // test some async handling
            new Promise<void>(resolve => { // @ts-ignore
                    setTimeout(() => {
                            resolve();
                        },
                        1000
                    );
                }
            ).then(() => {
                // clear / free reference
                // @ts-ignore
                el = window._protected_reference = undefined;
            });

        });

        el.click(); // open
    };

    const router = useRoutes([
        {
            path: QuizCarouselNode.pathname,
            element: <QuizCardCarousel/>
        },
        {
            path: HomeNode.pathname,
            element: <LandingPage
                    onTextUpload={({text, name}) =>
                        m.uploadingDocumentsService.upload(
                            {
                                file: new File([text], name),
                                language_code: readingLanguageCode
                            }
                        )
                    }
                    onFileSelected={({file}) =>
                        m.uploadingDocumentsService.upload(
                            {
                                file,
                                language_code: readingLanguageCode
                            }
                        )
                    }
                    languages={languages}
                    language={language}
                    setLanguage={setLanguage}
                    variant={variant}
                    setVariant={setVariant}
                    dragActive={dragActive}
                    onDragEnter={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                    ref={inputRef}
                />,

        },
    ]);

    return <div className="w-full h-full relative flex flex-col">
        <NavBarAndSettingsPopup
            languages={languages}
            navBarItems={navBarItems}
            language={language}
            setLanguage={setLanguage}
            setVariant={setVariant}
            variant={variant}
            currentUserEmail={currentUserEmail}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
        />
        {router}
    </div>
};