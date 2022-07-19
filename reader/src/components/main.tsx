import React, { useEffect } from 'react'
import { Manager } from '../lib/manager/Manager'
import { useObservableState } from 'observable-hooks'
import { HotKeyEvents } from '../lib/hotkeys/HotKeyEvents'
import { AppDirectory } from './app-directory/app-directory-service'
import { Subject } from 'rxjs'
import { Hotkeys } from '../lib/hotkeys/hotkeys.interface'
import { MiniDrawer } from './app-container/drawer'
import './mouseover-div/mouseover-div'
import { useShowIntroModal } from '../lib/intro/use-show-intro-modal'

export const FocusedElement = React.createContext<
    HTMLElement | Document | null
>(null)
export const HotkeyContext = React.createContext<Partial<Hotkeys<string[]>>>({})
// It's a string because I may want to filter observables to show, instead of showing/hiding all of them
export const ShowObservableContext = React.createContext<string>("");
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
                          <MiniDrawer />
                      </AudioRecorderResizedContext.Provider>
                  </PronunciationVideoResizedContext.Provider>
              </FocusedElement.Provider>
          </HotkeyContext.Provider>
      </ShowObservableContext.Provider>
    )
}
