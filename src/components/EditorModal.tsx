import { Box, Button, Divider, Modal, Paper, useMediaQuery, useTheme } from '@mui/material'
import { CCPostEditor, type CCPostEditorProps, type EditorMode } from './Editor/CCPostEditor'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useGlobalState } from '../context/GlobalState'
import { usePreference } from '../context/PreferenceContext'
import { type CommunityTimelineSchema, type Message, type Timeline } from '@concurrent-world/client'
import { MessageContainer } from './Message/MessageContainer'

export interface EditorModalState {
    open: (opts?: OpenOptions) => void
    registerOptions: (options: Options) => void
    unregisterOptions: (options: Options) => void
}

const EditorModalContext = createContext<EditorModalState>({
    open: () => {},
    registerOptions: () => {},
    unregisterOptions: () => {}
})

export interface OpenOptions {
    draft?: string
    mode?: EditorMode
    target?: Message<any>
    streamPickerInitial?: Array<Timeline<CommunityTimelineSchema>>
}

export interface PostProps extends CCPostEditorProps {
    context?: JSX.Element
}

export interface Options {
    streamPickerInitial?: Array<Timeline<CommunityTimelineSchema>>
    defaultPostHome?: boolean
}

export interface EditorModalProps {
    children: JSX.Element | JSX.Element[]
}

export const EditorModalProvider = (props: EditorModalProps): JSX.Element => {
    const [viewportHeight, setViewportHeight] = useState<number>(visualViewport?.height ?? 0)
    useEffect(() => {
        function handleResize(): void {
            setViewportHeight(visualViewport?.height ?? 0)
        }
        visualViewport?.addEventListener('resize', handleResize)
        return () => visualViewport?.removeEventListener('resize', handleResize)
    }, [])

    const theme = useTheme()
    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))
    const globalState = useGlobalState()

    const [options, registerOptions] = useState<Options | null>(null)
    const unregisterOptions = useCallback(
        (oldOptions: Options) => {
            registerOptions((curr) => {
                return curr === oldOptions ? null : curr
            })
        },
        [options]
    )

    const modalProps = isMobileSize
        ? {
              backdrop: {
                  sx: {
                      backgroundColor: 'background.default'
                  }
              }
          }
        : {}

    const [postProps, setPostProps] = useState<PostProps | null>(null)

    const [lists] = usePreference('lists')
    const home = Object.keys(lists).length > 0 ? lists[Object.keys(lists)[0]] : null
    const homePostTimelines = useMemo(() => {
        console.log(home)
        if (!home) return []
        return home.defaultPostStreams
            .map((timelineID) => globalState.allKnownTimelines.find((e) => e.id === timelineID))
            .filter((e) => e) as Array<Timeline<CommunityTimelineSchema>>
    }, [lists, globalState.allKnownTimelines])

    const open = (openOpts?: OpenOptions): void => {
        const opts = options ?? {}
        console.log(openOpts?.streamPickerInitial, opts.streamPickerInitial, homePostTimelines)
        setPostProps({
            streamPickerInitial: openOpts?.streamPickerInitial ?? opts.streamPickerInitial ?? homePostTimelines,
            streamPickerOptions: globalState.allKnownTimelines,
            defaultPostHome:
                opts.defaultPostHome ?? (home?.defaultPostHome === undefined ? true : home.defaultPostHome),
            actionTo: openOpts?.target,
            mode: openOpts?.mode,
            context: openOpts?.target ? (
                <Box width="100%" maxHeight={isMobileSize ? '3rem' : 'unset'} overflow="auto">
                    <MessageContainer simple messageID={openOpts.target.id} messageOwner={openOpts.target.author} />
                </Box>
            ) : undefined,
            allowEmpty: openOpts?.mode === 'reroute',
            onPost: () => {
                setPostProps(null)
            },
            value: openOpts?.draft
        })
    }

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return
            }
            switch (event.key) {
                case 'n':
                    setTimeout(() => {
                        open()
                    }, 3)
                    break
            }
        },
        [open]
    )

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [handleKeyPress])

    return (
        <EditorModalContext.Provider
            value={useMemo(() => {
                return {
                    open,
                    registerOptions,
                    unregisterOptions
                }
            }, [open, registerOptions, unregisterOptions])}
        >
            {props.children}
            <Modal
                open={postProps !== null}
                onClose={() => {
                    setPostProps(null)
                }}
                slotProps={modalProps}
            >
                <Box>
                    {postProps && (
                        <>
                            {!isMobileSize ? (
                                <Paper
                                    sx={{
                                        position: 'absolute',
                                        top: '10%',
                                        left: '50%',
                                        transform: 'translate(-50%, 0%)',
                                        width: '700px',
                                        maxWidth: '90vw'
                                    }}
                                >
                                    {postProps.context && (
                                        <Box
                                            sx={{
                                                p: 1
                                            }}
                                        >
                                            {postProps.context}
                                            <Divider />
                                        </Box>
                                    )}

                                    <CCPostEditor
                                        autoFocus
                                        minRows={3}
                                        maxRows={7}
                                        {...postProps}
                                        sx={{
                                            p: 1
                                        }}
                                    />
                                </Paper>
                            ) : (
                                <Box
                                    sx={{
                                        height: viewportHeight,
                                        maxHeight: '60vh',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        p: 0.5,
                                        backgroundColor: 'background.default'
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            flex: 1,
                                            p: 0.5
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Button
                                                variant="text"
                                                onClick={() => {
                                                    setPostProps(null)
                                                }}
                                                sx={{
                                                    px: 1
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                        {postProps.context && (
                                            <>
                                                <Divider />
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        py: 1
                                                    }}
                                                >
                                                    {postProps.context}
                                                </Box>
                                            </>
                                        )}
                                        <Divider />
                                        <CCPostEditor mobile autoFocus {...postProps} />
                                    </Paper>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Modal>
        </EditorModalContext.Provider>
    )
}

export function useEditorModal(): EditorModalState {
    return useContext(EditorModalContext)
}
