import { Box, Paper, Modal } from '@mui/material'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { Schemas } from '../schemas'
import { Draft } from '../components/Draft'
import { type SimpleNote } from '../schemas/simpleNote'
import { useLocation } from 'react-router-dom'
import { usePreference } from './PreferenceContext'

export interface GlobalActionsState {
    openDraft: () => void
}

const GlobalActionsContext = createContext<GlobalActionsState | undefined>(undefined)

interface GlobalActionsProps {
    children: JSX.Element | JSX.Element[]
}

const style = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '700px',
    maxWidth: '90vw',
    p: 1
}

export const GlobalActionsProvider = (props: GlobalActionsProps): JSX.Element => {
    const api = useApi()
    const pref = usePreference()
    const reactlocation = useLocation()
    const [mode, setMode] = useState<'compose' | 'none'>('none')

    const openDraft = useCallback(() => {
        setMode('compose')
    }, [])

    const queriedStreams = reactlocation.hash
        .replace('#', '')
        .split(',')
        .filter((e) => e !== '')

    const streamPickerInitial = [
        ...new Set([
            ...(reactlocation.hash && reactlocation.hash !== '' ? pref.defaultPostNonHome : pref.defaultPostHome),
            ...queriedStreams
        ])
    ]

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'n':
                setTimeout(() => {
                    // XXX: this is a hack to prevent the keypress from being captured by the draft
                    openDraft()
                }, 0)
                break
        }
    }, [])

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress)

        // remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [handleKeyPress])

    return (
        <GlobalActionsContext.Provider
            value={useMemo(() => {
                return {
                    openDraft
                }
            }, [])}
        >
            {props.children}
            <Modal
                open={mode !== 'none'}
                onClose={() => {
                    setMode('none')
                }}
            >
                <Paper sx={style}>
                    <Box sx={{ display: 'flex' }}>
                        <Draft
                            autoFocus
                            streamPickerInitial={streamPickerInitial}
                            onSubmit={async (text: string, destinations: string[]) => {
                                const body = {
                                    body: text
                                }
                                return await api
                                    .createMessage<SimpleNote>(Schemas.simpleNote, body, destinations)
                                    .then((_) => {
                                        return null
                                    })
                                    .catch((e) => {
                                        return e
                                    })
                                    .finally(() => {
                                        setMode('none')
                                    })
                            }}
                        />
                    </Box>
                </Paper>
            </Modal>
        </GlobalActionsContext.Provider>
    )
}

export function useGlobalActions(): GlobalActionsState {
    return useContext(GlobalActionsContext) as GlobalActionsState
}
