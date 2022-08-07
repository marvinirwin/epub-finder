import React, { useEffect } from "react";
import { Manager } from "../lib/manager/Manager";
import { useObservableState } from "observable-hooks";
import { HotKeyEvents } from "../lib/hotkeys/HotKeyEvents";
import { AppDirectory } from "./app-directory/app-directory-service";
import { Subject } from "rxjs";
import { Hotkeys } from "../lib/hotkeys/hotkeys.interface";
import "./mouseover-div/mouseover-div";
import { useShowIntroModal } from "../lib/intro/use-show-intro-modal";
import { ShowObservableContext } from "../ShowObservableContext";
import {PageWrapper} from "./menu-landing-page/PageWrapper.component";

export const FocusedElement = React.createContext<
    HTMLElement | Document | null
>(null)
export const HotkeyContext = React.createContext<Partial<Hotkeys<string[]>>>({})
const audioRecorderResized$ = new Subject<void>()
const pronunciationVideoResized$ = new Subject<void>()
export const AudioRecorderResizedContext = React.createContext<Subject<void>>(
    audioRecorderResized$,
)
export const PronunciationVideoResizedContext = React.createContext<
    Subject<void>
>(pronunciationVideoResized$)

export function Main({ m }: { m: Manager }) {
    useEffect(() => {
        m.browserInputsService.applyDocumentListeners(document)
        m.treeMenuService.tree.appendDelta$.next(AppDirectory(m))
    }, [m])
    useShowIntroModal()

    const hotkeyHandler =
        useObservableState(m.browserInputsService.focusedElement$) || null
    const hotkeyConfig = useObservableState(m.settingsService.hotkeys$, {})
    const withDefaults = { ...HotKeyEvents.defaultHotkeys(), ...hotkeyConfig }
    const urlParams = new URLSearchParams(window.location.search)

    return (
      <ShowObservableContext.Provider value={urlParams.get('visible-observables') || ''}>
          <HotkeyContext.Provider value={withDefaults}>
              <FocusedElement.Provider value={hotkeyHandler}>
                  <PronunciationVideoResizedContext.Provider
                    value={pronunciationVideoResized$}
                  >
                      <AudioRecorderResizedContext.Provider
                        value={audioRecorderResized$}
                      >
                          <PageWrapper />
                      </AudioRecorderResizedContext.Provider>
                  </PronunciationVideoResizedContext.Provider>
              </FocusedElement.Provider>
          </HotkeyContext.Provider>
      </ShowObservableContext.Provider>
    )
}
