import React, {forwardRef, useState} from "react";
import {flatten} from "lodash";
import {supportedDocumentFileExtensions} from "../../lib/uploading-documents/uploading-documents.service";
import CameraComponent from "../camera/take-picture";
import {Library} from "../library/library.component";
import {Button, Textarea, TextInput} from "flowbite-react";
import {LandingPageProps} from "./LandingPageProps";
import {VideoMetdataList} from "./VideoMetdataList";

export type VariantLanguageOption = { value: string, label: string };
export type ParentLanguageOption = { value: string, label: string, variants: VariantLanguageOption[] };

export const LandingPage = forwardRef<HTMLInputElement, LandingPageProps>((
    {
        dragActive,
        language,
        languages,
        onClick,
        onDragEnter,
        onDrop,
        setLanguage,
        setVariant,
        variant,
        onFileSelected,
        onTextUpload
    }, ref) => {
    const [uploadedFileName, setUploadedFileName] = useState<string>("")
    const [uploadedFileText, setUploadedFileText] = useState<string>("");
    const validExtensionList = Array.from(supportedDocumentFileExtensions).map(ext => `.${ext}`).join(', ');
    return <div className="w-full flex flex-row grow">
        <div className="flex flex-col w-1/2 p-8">
            <CameraComponent onPictureTaken={(image) => {
                onFileSelected({name: uploadedFileName, file: image})
            }}/>
            <Library/>
        </div>
        <div className="flex flex-col w-1/2 p-5">
            <div className="flex flex-col justify-center items-center m-8">
                <select
                    className="w-[300px] h-11 mb-[30px] text-1rem text-[#71717A]"
                    defaultValue={language?.value}
                    value={language?.value}
                    onChange={v => setLanguage(languages.find(l => l.value === v.target.value) as ParentLanguageOption)}
                >
                    {languages.map(l => <option value={l.value}>{l.label}</option>)}
                </select>
                {language?.variants?.length && (
                    <select
                        className="w-[300px] h-11 text-1rem text-[#71717A]"
                        defaultValue={variant?.value}
                        value={variant?.value}
                        onChange={(e) => {
                            const allVariants = flatten(languages.map(l => l.variants));
                            setVariant(allVariants.find(v => v.value === e.target.value) as VariantLanguageOption);
                        }}
                    >
                        {
                            language.variants.map(v => <option
                                value={v.value}
                                className="text-1rem text-[#71717A]">
                                {v.label}
                            </option>)
                        }
                    </select>
                )}
            </div>
            <TextInput
                value={uploadedFileName}
                onChange={e => setUploadedFileName(e.target.value)}
                placeholder={'The label of your uploaded material.  Will use filename if left blank.'}
            />
            &nbsp;
            <div className='flex flex-col justify-center'>
                <Textarea
                    value={uploadedFileText}
                    placeholder={'Use this when you want to upload some text and not a file'}
                    onChange={e => setUploadedFileText(e.target.value)}
                />
                <Button
                    onClick={() => {
                        if (!uploadedFileText || !uploadedFileName) {
                            alert(`Please enter a name and some text to upload`);
                            return;
                        }
                        onTextUpload({text: uploadedFileText, name: `${uploadedFileName}.txt`})
                    }}
                >
                    Upload Text
                </Button>
            </div>
            <div
                className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center flex-1 ${
                    dragActive && "border-[#0F91D2] bg-slate-100"
                }`}
                onDragEnter={onDragEnter}
                onDragOver={onDragEnter}
                onDragLeave={onDragEnter}
                onDrop={e => onDrop(
                    {
                        e,
                        filename: uploadedFileName
                    }
                )}
            >
                <input ref={ref} className="hidden" type="file" id="input-file-upload" multiple={true}
                       accept={validExtensionList}/>
                <label id="label-file-upload" htmlFor="file-upload" className={dragActive ? "drag-active" : ""}>
                    <div className="flex flex-col justify-center items-center">
                        <img className="w-12 h-12 mb-8" src={require("./upload-cloud.svg").default}/>
                        <p className="mx-5 mb-3">Select a file or drag and drop here</p>
                        <p className="mx-5 mb-5 text-gray-400">{validExtensionList} file size no more than 10mb</p>
                        <button
                            className="px-3 py-2 text-sm text-[#0F91D2] rounded-lg border border-[#0f91d2]"
                            onClick={onClick}
                        >
                            SELECT FILE
                        </button>
                    </div>
                </label>
            </div>
        </div>
        <VideoMetdataList/>
    </div>;
});

