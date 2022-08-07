import React, {DragEvent, useContext, useRef} from "react";
import {NavBarAndSettingsPopup} from "../settings-popup/NavBarAndSettingsPopup.component";
import {LandingPage, ParentLanguageOption, VariantLanguageOption} from "./menu-landing-page.component";
import {TreeMenuNode} from "../app-directory/tree-menu-node.interface";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {SupportedTranslations} from "@shared/";
import {mapTranslatableLanguagesToSpokenOnes} from "../../lib/language/mapTranslatableLanguagesToSpokenOnes";
import {flatten} from "lodash";
import {ReadingNode} from "../app-directory/reading.node";
import {SignInWithNode} from "../app-directory/nodes/sign-in-with.node";
import {LanguageSelectNode} from "../app-directory/nodes/language-select.node";
import {RecognizeSpeechNode} from "../app-directory/nodes/recognize-speech.node";
import {WatchPronunciationNode} from "../app-directory/nodes/watch-pronunciation.node";
import {LibraryNode} from "../app-directory/nodes/library.node";
import {ReadingProgressNode} from "../app-directory/nodes/reading-progress.node";
import {QuizScheduleNode} from "../app-directory/nodes/quiz-schedule.node";
import {LeaderBoardNode} from "../app-directory/nodes/leader-board.node";
import {SettingsNode} from "../app-directory/nodes/settings.node";
import {TestingUtilsNode} from "../app-directory/nodes/testing-utils.node";

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
    ReadingNode(m),
    SignInWithNode(),
    LanguageSelectNode(m),
    RecognizeSpeechNode(m),
    WatchPronunciationNode(m),
    LibraryNode(m),
    ReadingProgressNode(m),
    QuizScheduleNode(m),
    LeaderBoardNode(m),
    SettingsNode(m),
    TestingUtilsNode(m),
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

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
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
      new Promise<void>(function (resolve) {
          // @ts-ignore
          setTimeout(function () {
              resolve();
            },
            1000
          );
        }
      )
        .then(function () {
          // clear / free reference
          // @ts-ignore
          el = window._protected_reference = undefined;
        });

    });

    el.click(); // open
  };

  const getSelectedPage = () => {
    switch (currentComponent) {
      default:
        return <LandingPage
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
        />
    }
  }

  return (
    <div className="w-full h-full relative">
      <NavBarAndSettingsPopup
        languages={languages}
        navBarItems={navBarItems}
        language={language}
        setLanguage={setLanguage}
        setVariant={setVariant}
        variant={variant}
      />
      {getSelectedPage()}
    </div>
  );
};