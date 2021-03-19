import {Segment} from "@shared/";
import {XMLDocumentNode} from "../../../server/src/shared/XMLDocumentNode";
import {combineLatest, Observable} from "rxjs";
import {LanguageConfigsService} from "./language-configs.service";
import {SettingsService} from "../services/settings.service";
import {map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {fetchTranslation} from "../services/translate.service";
import {transliterate} from "./transliterate.service";

export class BrowserSegment extends Segment{
    translation$: Observable<string>;
    romanization$: Observable<string>;
    mouseoverText$: Observable<{title: string, subtitle: string}>;
    constructor( {
        element,
        languageConfigsService,
        settingsService
                 }:{
        element: XMLDocumentNode,
        languageConfigsService: LanguageConfigsService,
        settingsService: SettingsService
    }, ) {
        super(element);
        this.translation$ = languageConfigsService
            .learningToKnownTranslateFn$
            .pipe(
                switchMap(translateConfig => translateConfig ? fetchTranslation({...translateConfig, text: this.translatableText}) : ''),
                shareReplay(1)
            );
        this.romanization$ = languageConfigsService
            .learningToLatinTransliterateFn$
            .pipe(
                switchMap(romanizationConfig => romanizationConfig ? transliterate({...romanizationConfig, text: this.translatableText}) : ''),
                shareReplay(1)
            );
        this.mouseoverText$ = combineLatest([
            this.translation$.pipe(startWith('')),
            this.romanization$.pipe(startWith('')),
            settingsService.showRomanization$,
            settingsService.showTranslation$
        ]).pipe(
            map(([translation, romanization, showRomanization, showTranslation]) => {
                return {
                    title: showRomanization ? (romanization || '') : '',
                    subtitle: showTranslation ? (translation || '') : ''
                }
            }),
            shareReplay(1)
        )
    }
}