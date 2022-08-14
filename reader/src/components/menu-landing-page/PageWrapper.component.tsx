import React, {DragEvent, useContext, useRef} from "react";
import {NavBarAndSettingsPopup} from "../settings-popup/NavBarAndSettingsPopup.component";
import {LandingPage, ParentLanguageOption, VariantLanguageOption} from "./menu-landing-page.component";
import {TreeMenuNode} from "../app-directory/tree-menu-node.interface";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {SupportedTranslations} from "@shared/";
import {mapTranslatableLanguagesToSpokenOnes} from "../../lib/language/mapTranslatableLanguagesToSpokenOnes";
import {flatten} from "lodash";
import {LibraryNode} from "../app-directory/nodes/library.node";
import {QuizCardCarousel} from "../quiz/quiz-card-carousel.component";
import {LibraryTable} from "../library/library-table.component";
import {QuizCarouselNode} from "../app-directory/nodes/quiz-carousel.node";
import {HomeNode} from "../app-directory/nodes/Home.node";

export type PageWrapperProps = {};

export const PageWrapper: React.FC<PageWrapperProps> = ({}) => {
  const m = useContext(ManagerContext);
  const readingLanguageCode =
    useObservableState(m.settingsService.readingLanguage$) || ''
  const spokenLanguageCode =
    useObservableState(m.settingsService.spokenLanguage$) || ''
  const potentialSpokenLanguageCode =
    useObservableState(m.languageConfigsService.potentialLearningSpoken$) ||
    []
  const potentialTextToSpeech = useObservableState(m.languageConfigsService.potentialLearningLanguageTextToSpeechConfigs$) || []
  const chosenTextToSpeechConfig = useObservableState(m.settingsService.textToSpeechConfiguration$);
  const currentUserEmail = useObservableState(m.loggedInUserService.profile$)?.email;

  const languages: ParentLanguageOption[] = SupportedTranslations.map(t => {
      const v = {
        variants: mapTranslatableLanguagesToSpokenOnes(t.code).map(v => ({label: v.label, value: v.code})),
        label: t.label,
        value: t.code
      }
      return v as ParentLanguageOption;
    }
  );

  const onLanguageSelect = (v: ParentLanguageOption) => m.settingsService.readingLanguage$.next(v.value);
  const onVariantSelect = (v: VariantLanguageOption) => m.settingsService.spokenLanguage$.next(v.value);
  const onFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await m.uploadingDocumentsService.upload({file: file, language_code: readingLanguageCode});
    }
  }
  const navBarItems: TreeMenuNode[] = [
    HomeNode,
    LibraryNode,
    QuizCarouselNode,
  ];
  const language = languages.find(language => language.value === readingLanguageCode);
  const setLanguage = (v: ParentLanguageOption) => m.settingsService.readingLanguage$.next(v.value);
  const variant = flatten(languages.map(l => l.variants)).find(v => v.value === spokenLanguageCode) as VariantLanguageOption;
  const setVariant = (v: VariantLanguageOption) => m.settingsService.spokenLanguage$.next(v.value)
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentComponent = useObservableState(m.settingsService.componentPath$)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
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
    var el = window._protected_reference = document.createElement("INPUT");
    // @ts-ignore
    el.type = "file";
    // @ts-ignore
    el.accept = "image/*";
    // @ts-ignore
    el.multiple = "multiple"; // remove to have a single file selection

    // (cancel will not trigger 'change')
    el.addEventListener('change', function (ev2) {
      //@ts-ignore
      onFileUpload(el.files)
      // access el.files[] to do something with it (test its length!)
      // test some async handling
      new Promise<void>(function (resolve) { // @ts-ignore
          setTimeout(function () {
              resolve();
            },
            1000
          );
        }
      ).then(function () {
        // clear / free reference
        // @ts-ignore
        el = window._protected_reference = undefined;
      });

    });

    el.click(); // open
  };

  const getSelectedPage = (): [TreeMenuNode, React.ReactNode] => {
    switch (currentComponent) {
      case "quiz-carousel":
        return [
          QuizCarouselNode,
          <QuizCardCarousel/>
        ]
      case "library":
        return [
          LibraryNode,
          <LibraryTable/>,

        ]
      case "LandingPage":
      default:
        return [
          HomeNode,
          <LandingPage
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

        ]
    }
  }
  const [currentNode, currentPage] = getSelectedPage();

  return <div className="w-full h-full relative">
      <NavBarAndSettingsPopup
        languages={languages}
        navBarItems={navBarItems}
        language={language}
        setLanguage={setLanguage}
        setVariant={setVariant}
        variant={variant}
        currentUserEmail={currentUserEmail}
        selectedNavItem={currentNode}
      />
      {currentPage}
    </div>
};