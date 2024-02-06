import { Box, Paper, Modal, Typography, Divider, Button, Drawer, useTheme, useMediaQuery, Tooltip } from '@mui/material'
import { InspectorProvider } from '../context/Inspector'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import {
    Schemas,
    type Message,
    type Stream,
    type CommonstreamSchema,
    type DomainProfileSchema
} from '@concurrent-world/client'
import { Draft } from '../components/Draft'
import { MobileDraft } from '../components/MobileDraft'
import { useLocation } from 'react-router-dom'
import { usePreference } from './PreferenceContext'
import { ProfileEditor } from '../components/ProfileEditor'
import { MessageContainer } from '../components/Message/MessageContainer'
import { Menu } from '../components/Menu/Menu'
import { LogoutButton } from '../components/Settings/LogoutButton'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type EmojiPackage } from '../model'
import { experimental_VGrid as VGrid } from 'virtua'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { ImagePreviewModal } from '../components/ui/ImagePreviewModal'

export interface GlobalActionsState {
    openDraft: (text?: string) => void
    openReply: (target: Message<any>) => void
    openReroute: (target: Message<any>) => void
    openMobileMenu: (open?: boolean) => void
    allKnownStreams: Array<Stream<CommonstreamSchema>>
    draft: string
    openEmojipack: (url: EmojiPackage) => void
    openImageViewer: (url: string) => void
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
    maxWidth: '90vw'
}

const RowEmojiCount = 6

export const GlobalActionsProvider = (props: GlobalActionsProps): JSX.Element => {
    const client = useApi()
    const [lists] = usePreference('lists')
    const [emojiPackages, setEmojiPackages] = usePreference('emojiPackages')
    const { enqueueSnackbar } = useSnackbar()
    const path = useLocation()
    const theme = useTheme()
    const [draft, setDraft] = useState<string>('')
    const [mode, setMode] = useState<'compose' | 'reply' | 'reroute' | 'none'>('none')
    const [targetMessage, setTargetMessage] = useState<Message<any> | null>(null)

    const [queriedStreams, setQueriedStreams] = useState<Array<Stream<CommonstreamSchema>>>([])
    const [allKnownStreams, setAllKnownStreams] = useState<Array<Stream<CommonstreamSchema>>>([])
    const [domainIsOffline, setDomainIsOffline] = useState<boolean>(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
    const [previewImage, setPreviewImage] = useState<string | undefined>()

    const [emojiPack, setEmojiPack] = useState<EmojiPackage>()
    const emojiPackAlreadyAdded = useMemo(() => {
        return emojiPackages.find((p) => p === emojiPack?.packageURL) !== undefined
    }, [emojiPack, emojiPackages])

    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))

    const { t } = useTranslation('')

    const [viewportHeight, setViewportHeight] = useState<number>(visualViewport?.height ?? 0)
    useEffect(() => {
        function handleResize(): void {
            setViewportHeight(visualViewport?.height ?? 0)
        }
        visualViewport?.addEventListener('resize', handleResize)
        return () => visualViewport?.removeEventListener('resize', handleResize)
    }, [])

    const setupAccountRequired =
        client?.user !== null &&
        (client?.user.profile === undefined ||
            client?.user.userstreams === undefined ||
            !client?.user.userstreams.payload.body.homeStream ||
            !client?.user.userstreams.payload.body.notificationStream ||
            !client?.user.userstreams.payload.body.associationStream ||
            !client?.user.userstreams.payload.body.ackCollection)

    useEffect(() => {
        let unmounted = false
        setAllKnownStreams([])
        const allStreams = Object.values(lists)
            .map((list) => list.streams)
            .flat()
        const uniq = [...new Set(allStreams)]
        console.log('uniq: ', uniq)
        uniq.forEach((id) => {
            client.getStream<CommonstreamSchema>(id).then((stream) => {
                if (stream && !unmounted) {
                    setAllKnownStreams((prev) => [...prev, stream])
                }
            })
        })
        return () => {
            unmounted = true
        }
    }, [lists])

    useEffect(() => {
        client.api.getDomain(client.api.host).then((domain) => {
            if (domain === null) {
                setDomainIsOffline(true)
            }
        })
    }, [client.user])

    const updateQueriedStreams = useCallback(() => {
        let streamIDs: string[] = []
        switch (path.pathname) {
            case '/stream': {
                streamIDs = path.hash.replace('#', '').split(',')
                break
            }
            default: {
                const rawid = path.hash.replace('#', '')
                const list = lists[rawid] ?? Object.values(lists)[0]
                if (!list) break
                streamIDs = list.defaultPostStreams
                break
            }
        }

        Promise.all(streamIDs.map((id) => client.getStream(id))).then((streams) => {
            setQueriedStreams(streams.filter((e) => e !== null) as Array<Stream<CommonstreamSchema>>)
        })
    }, [path.pathname, path.hash, lists])

    const openDraft = useCallback(
        (draft?: string) => {
            setDraft(draft ?? '')
            updateQueriedStreams()
            setMode('compose')
        },
        [updateQueriedStreams]
    )

    const openReply = useCallback((target: Message<any>) => {
        setTargetMessage(target)
        setMode('reply')
    }, [])

    const openReroute = useCallback(
        (target: Message<any>) => {
            updateQueriedStreams()
            setTargetMessage(target)
            setMode('reroute')
        },
        [setTargetMessage, setMode, updateQueriedStreams]
    )

    const openMobileMenu = useCallback((open?: boolean) => {
        setMobileMenuOpen(open ?? true)
    }, [])

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return
            }
            switch (event.key) {
                case 'n':
                    setTimeout(() => {
                        // XXX: this is a hack to prevent the keypress from being captured by the draft
                        openDraft()
                    }, 0)
                    break
            }
        },
        [openDraft]
    )

    const openEmojipack = useCallback((pack: EmojiPackage) => {
        setEmojiPack(pack)
    }, [])

    const openImageViewer = useCallback((url: string) => {
        setPreviewImage(url)
    }, [])

    const fixAccount = useCallback(async () => {
        console.log('starting account fix')
        await client.setupUserstreams()
        console.log('userstream setup complete')
        const domain = await client.api.getDomain(client.api.host)
        if (!domain) throw new Error('Domain not found')
        try {
            const domainProfile = await client.api.getCharacter<DomainProfileSchema>(domain.ccid, Schemas.domainProfile)
            if (!domainProfile) throw new Error('Domain profile not found')
            if (domainProfile.payload.body.defaultBookmarkStreams)
                localStorage.setItem(
                    'bookmarkingStreams',
                    JSON.stringify(domainProfile.payload.body.defaultBookmarkStreams)
                )
            if (domainProfile.payload.body.defaultFollowingStreams)
                localStorage.setItem(
                    'followingStreams',
                    JSON.stringify(domainProfile.payload.body.defaultFollowingStreams)
                )
            if (domainProfile.payload.body.defaultPostStreams)
                localStorage.setItem('postingStreams', JSON.stringify(domainProfile.payload.body.defaultPostStreams))
        } catch (e) {
            console.info(e)
        }
        window.location.reload()
    }, [client])

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress)

        // remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [handleKeyPress])

    const modalProps = isMobileSize
        ? {
              backdrop: {
                  sx: {
                      backgroundColor: 'background.default'
                  }
              }
          }
        : {}

    return (
        <GlobalActionsContext.Provider
            value={useMemo(() => {
                return {
                    openDraft,
                    openReply,
                    openReroute,
                    openMobileMenu,
                    allKnownStreams,
                    draft,
                    openEmojipack,
                    openImageViewer
                }
            }, [openDraft, openReply, openReroute, openMobileMenu, allKnownStreams])}
        >
            <InspectorProvider>
                <>{props.children}</>
                <Modal
                    open={mode !== 'none'}
                    onClose={() => {
                        setMode('none')
                    }}
                    slotProps={modalProps}
                >
                    <>
                        {isMobileSize ? (
                            <>
                                <Box
                                    sx={{
                                        height: viewportHeight,
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
                                        {mode === 'compose' && (
                                            <MobileDraft
                                                streamPickerInitial={queriedStreams}
                                                streamPickerOptions={allKnownStreams}
                                                onSubmit={async (text: string, destinations: string[], options) => {
                                                    await client
                                                        .createCurrent(text, destinations, options)
                                                        .catch((e) => {
                                                            return e
                                                        })
                                                        .finally(() => {
                                                            setMode('none')
                                                        })
                                                    return null
                                                }}
                                                onCancel={() => {
                                                    setMode('none')
                                                }}
                                            />
                                        )}
                                        {targetMessage && (mode === 'reply' || mode === 'reroute') && (
                                            <MobileDraft
                                                allowEmpty={mode === 'reroute'}
                                                submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                                streamPickerInitial={
                                                    mode === 'reroute'
                                                        ? queriedStreams
                                                        : targetMessage.postedStreams ?? []
                                                }
                                                streamPickerOptions={
                                                    mode === 'reroute'
                                                        ? allKnownStreams
                                                        : targetMessage.postedStreams ?? []
                                                }
                                                onSubmit={async (text, streams, options): Promise<Error | null> => {
                                                    if (mode === 'reroute') {
                                                        await targetMessage.reroute(streams, text, options?.emojis)
                                                    } else if (mode === 'reply') {
                                                        await targetMessage.reply(streams, text, options?.emojis)
                                                    }
                                                    setMode('none')
                                                    return null
                                                }}
                                                onCancel={() => {
                                                    setMode('none')
                                                }}
                                                context={
                                                    <Box width="100%" maxHeight="3rem" overflow="auto">
                                                        <MessageContainer
                                                            simple
                                                            messageID={targetMessage.id}
                                                            messageOwner={targetMessage.author}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        )}
                                    </Paper>
                                </Box>
                            </>
                        ) : (
                            <>
                                {mode === 'compose' && (
                                    <Paper sx={style}>
                                        <Box sx={{ display: 'flex' }}>
                                            <Draft
                                                autoFocus
                                                value={draft}
                                                streamPickerInitial={queriedStreams}
                                                streamPickerOptions={allKnownStreams}
                                                onSubmit={async (text: string, destinations: string[], options) => {
                                                    await client
                                                        .createCurrent(text, destinations, options)
                                                        .catch((e) => {
                                                            return e
                                                        })
                                                        .finally(() => {
                                                            setMode('none')
                                                        })
                                                    return null
                                                }}
                                                sx={{
                                                    p: 1
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                )}
                                {targetMessage && (mode === 'reply' || mode === 'reroute') && (
                                    <Paper sx={style}>
                                        <Box p={1}>
                                            <MessageContainer
                                                messageID={targetMessage.id}
                                                messageOwner={targetMessage.author}
                                            />
                                        </Box>
                                        <Divider />
                                        <Box sx={{ display: 'flex' }}>
                                            <Draft
                                                autoFocus
                                                allowEmpty={mode === 'reroute'}
                                                submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                                streamPickerInitial={
                                                    mode === 'reroute'
                                                        ? queriedStreams
                                                        : targetMessage.postedStreams ?? []
                                                }
                                                streamPickerOptions={
                                                    mode === 'reroute'
                                                        ? allKnownStreams
                                                        : targetMessage.postedStreams ?? []
                                                }
                                                onSubmit={async (text, streams, options): Promise<Error | null> => {
                                                    if (mode === 'reroute') {
                                                        await targetMessage.reroute(streams, text, options?.emojis)
                                                    } else if (mode === 'reply') {
                                                        await targetMessage.reply(streams, text, options?.emojis)
                                                    }
                                                    setMode('none')
                                                    return null
                                                }}
                                                sx={{
                                                    p: 1
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                )}
                            </>
                        )}
                    </>
                </Modal>
                <Modal open={domainIsOffline} onClose={() => {}}>
                    <Paper sx={style}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                p: 1,
                                gap: 1
                            }}
                        >
                            <Typography>
                                あなたのドメイン{client.api.host}は現在オフラインです。復旧までしばらくお待ちください。
                            </Typography>
                            <Button
                                onClick={() => {
                                    window.location.reload()
                                }}
                            >
                                Reload
                            </Button>
                            <LogoutButton />
                        </Box>
                    </Paper>
                </Modal>
                <Modal open={setupAccountRequired} onClose={() => {}}>
                    <Paper sx={style}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h2" component="div">
                                アカウント設定を完了させましょう！
                            </Typography>
                            見つかった問題:
                            <ul>
                                {!client?.user?.profile && <li>プロフィールが存在していません</li>}
                                {!client?.user?.userstreams?.payload.body.homeStream && (
                                    <li>ホームストリームが存在していません</li>
                                )}
                                {!client?.user?.userstreams?.payload.body.notificationStream && (
                                    <li>通知ストリームが存在していません</li>
                                )}
                                {!client?.user?.userstreams?.payload.body.associationStream && (
                                    <li>アクティビティストリームが存在していません</li>
                                )}
                                {!client?.user?.userstreams?.payload.body.ackCollection && (
                                    <li>Ackコレクションが存在していません</li>
                                )}
                            </ul>
                            <ProfileEditor
                                id={client?.user?.profile?.id}
                                initial={client?.user?.profile?.payload.body}
                                onSubmit={(_) => {
                                    fixAccount()
                                }}
                            />
                        </Box>
                    </Paper>
                </Modal>
                <ImagePreviewModal
                    src={previewImage}
                    onClose={() => {
                        setPreviewImage(undefined)
                    }}
                />
                <Drawer
                    anchor={'left'}
                    open={mobileMenuOpen}
                    onClose={() => {
                        setMobileMenuOpen(false)
                    }}
                    PaperProps={{
                        sx: {
                            width: '200px',
                            pt: 1,
                            borderRadius: `0 ${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0`,
                            overflow: 'hidden',
                            backgroundColor: 'background.default'
                        }
                    }}
                >
                    <Menu
                        onClick={() => {
                            setMobileMenuOpen(false)
                        }}
                    />
                </Drawer>
                <CCDrawer
                    open={!!emojiPack}
                    onClose={() => {
                        setEmojiPack(undefined)
                    }}
                >
                    <Box p={2}>
                        {emojiPack && (
                            <>
                                <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                                    <Typography variant="h1">{emojiPack.name}</Typography>
                                    <img src={emojiPack.iconURL} alt={emojiPack.name} height="30px" />
                                </Box>
                                <Typography variant="h3">{emojiPack.description}</Typography>
                                <Typography variant="h4">by {emojiPack.credits}</Typography>
                                <Divider />
                                <Typography variant="h2">preview</Typography>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={1}
                                >
                                    <VGrid
                                        row={Math.max(Math.ceil(emojiPack.emojis.length / RowEmojiCount), 4)} // HACK: 画面の高さを割るとvirtuaが壊れる
                                        col={RowEmojiCount}
                                        style={{
                                            overflowX: 'hidden',
                                            overflowY: 'auto',
                                            width: '310px',
                                            height: '300px'
                                        }}
                                        cellHeight={50}
                                        cellWidth={50}
                                    >
                                        {({ colIndex, rowIndex }) => {
                                            const emoji = emojiPack.emojis[rowIndex * RowEmojiCount + colIndex]
                                            if (!emoji) {
                                                return null
                                            }
                                            return (
                                                <Tooltip
                                                    arrow
                                                    placement="top"
                                                    title={
                                                        <Box display="flex" flexDirection="column" alignItems="center">
                                                            <img
                                                                src={emoji?.animURL ?? emoji?.imageURL ?? ''}
                                                                style={{
                                                                    height: '5em'
                                                                }}
                                                            />
                                                            <Divider />
                                                            <Typography variant="caption" align="center">
                                                                {emoji.shortcode}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                >
                                                    <img
                                                        src={emoji.imageURL}
                                                        alt={emoji.shortcode}
                                                        height="30px"
                                                        width="30px"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    </VGrid>
                                    <Button
                                        fullWidth
                                        onClick={() => {
                                            setEmojiPackages([...emojiPackages, emojiPack.packageURL])
                                            setEmojiPack(undefined)
                                            enqueueSnackbar('added!', { variant: 'success' })
                                        }}
                                        disabled={emojiPackAlreadyAdded}
                                    >
                                        {emojiPackAlreadyAdded ? ' (already added)' : 'Add to your collection'}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </CCDrawer>
            </InspectorProvider>
        </GlobalActionsContext.Provider>
    )
}

export function useGlobalActions(): GlobalActionsState {
    return useContext(GlobalActionsContext) as GlobalActionsState
}
