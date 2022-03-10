import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { closeModal } from '../redux/actions/contractActions'

export const useLoadingScreenHandler = () => {
    const dispatch = useDispatch()

    const closeModalHandler = useCallback(() => {
        dispatch(closeModal())
    }, [])

    const closeLoadingModalAfterDelay = useCallback(() => {
        setTimeout(() => {
            closeModalHandler()
        }, 2000)
    }, [])

    return { closeModal: closeModalHandler, closeLoadingModalAfterDelay }
}