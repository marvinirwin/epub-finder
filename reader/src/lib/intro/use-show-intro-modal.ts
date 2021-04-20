import { useContext } from 'react'
import { ManagerContext } from '../../App'
import { SHOW_INTRO } from '../util/url-params'

export const useShowIntroModal = () => {
    const m = useContext(ManagerContext)
    if (!localStorage.getItem('visitedBefore') || SHOW_INTRO) {
        localStorage.setItem('visitedBefore', '1')
        m.modalService.intro.open$.next(true)
    }
}
