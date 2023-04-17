import React from "react";
import {ParentLanguageOption, VariantLanguageOption} from "./LandingPage";

export type LandingPageProps = {
    languages: ParentLanguageOption[],
    language: ParentLanguageOption | undefined,
    setLanguage: (l: ParentLanguageOption) => unknown,
    variant: VariantLanguageOption | undefined,
    setVariant: (v: VariantLanguageOption) => unknown,
    dragActive: boolean,
    onDragEnter: (e: React.DragEvent) => void,
    onDrop: (p: { e: React.DragEvent, filename: string }) => void,
    ref: React.RefObject<HTMLInputElement>,
    onClick: () => void
    onFileSelected: (p: { file: File, name: string }) => void
    onTextUpload: (p: { text: string, name: string }) => void
};