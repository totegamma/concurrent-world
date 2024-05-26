import { Box, Paper, Modal, Typography, Divider, Button, Drawer, useTheme, useMediaQuery, Tooltip } from '@mui/material'
import { InspectorProvider } from '../context/Inspector'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useClient } from './ClientContext'
import {
    type Message,
    type Timeline,
    type CommunityTimelineSchema,
    type CoreSubscription,
    Schemas,
    type CoreTimeline
} from '@concurrent-world/client'
import { Draft } from '../components/Draft'
import { MobileDraft } from '../components/MobileDraft'
import { usePreference } from './PreferenceContext'
import { ProfileEditor } from '../components/ProfileEditor'
import { MessageContainer } from '../components/Message/MessageContainer'
import { Menu } from '../components/Menu/Menu'
import { LogoutButton } from '../components/Settings/LogoutButton'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type EmojiPackage } from '../model'
import { experimental_VGrid as VGrid } from 'virtua'
import { useSnackbar } from 'notistack'
import { ImagePreviewModal } from '../components/ui/ImagePreviewModal'
import { StreamCard } from '../components/Stream/Card'

export interface GlobalActionsState {
    openDraft: (text?: string) => void
    openReply: (target: Message<any>) => void
    openReroute: (target: Message<any>) => void
    openMobileMenu: (open?: boolean) => void
    allKnownTimelines: Array<Timeline<CommunityTimelineSchema>>
    listedSubscriptions: Record<string, CoreSubscription<any>>
    reloadList: () => void
    draft: string
    openEmojipack: (url: EmojiPackage) => void
    openImageViewer: (url: string) => void
    postStreams: Array<Timeline<CommunityTimelineSchema>>
    setPostStreams: (streams: Array<Timeline<CommunityTimelineSchema>>) => void
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
    const { client } = useClient()
    const [lists, setLists] = usePreference('lists')
    const [emojiPackages, setEmojiPackages] = usePreference('emojiPackages')
    const { enqueueSnackbar } = useSnackbar()
    const theme = useTheme()
    const [draft, setDraft] = useState<string>('')
    const [mode, setMode] = useState<'compose' | 'reply' | 'reroute' | 'none'>('none')
    const [targetMessage, setTargetMessage] = useState<Message<any> | null>(null)

    const [postStreams, setPostStreams] = useState<Array<Timeline<CommunityTimelineSchema>>>([])

    const isPostStreamsPublic = useMemo(() => postStreams.every((stream) => stream.indexable), [postStreams])

    const [allKnownTimelines, setAllKnownTimelines] = useState<Array<Timeline<CommunityTimelineSchema>>>([])
    const [listedSubscriptions, setListedSubscriptions] = useState<Record<string, CoreSubscription<any>>>({})
    const [domainIsOffline, setDomainIsOffline] = useState<boolean>(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
    const [previewImage, setPreviewImage] = useState<string | undefined>()

    const [emojiPack, setEmojiPack] = useState<EmojiPackage>()
    const emojiPackAlreadyAdded = useMemo(() => {
        return emojiPackages.find((p) => p === emojiPack?.packageURL) !== undefined
    }, [emojiPack, emojiPackages])

    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))

    const [viewportHeight, setViewportHeight] = useState<number>(visualViewport?.height ?? 0)
    useEffect(() => {
        function handleResize(): void {
            setViewportHeight(visualViewport?.height ?? 0)
        }
        visualViewport?.addEventListener('resize', handleResize)
        return () => visualViewport?.removeEventListener('resize', handleResize)
    }, [])

    const setupAccountRequired = client?.user !== null && client?.user.profile === undefined
    const noListDetected = Object.keys(lists).length === 0

    const [timelines, setTimelines] = useState<Array<CoreTimeline<CommunityTimelineSchema>>>([])
    const [selectedTieline, setSelectedTimeline] = useState<string | undefined>(undefined)

    const setupList = useCallback(
        (timeline?: string) => {
            client.api
                .upsertSubscription(
                    Schemas.listSubscription,
                    {
                        name: 'Home'
                    },
                    { indexable: false, domainOwned: false }
                )
                .then(async (sub) => {
                    if (timeline) {
                        await client.api.subscribe(timeline, sub.id)
                    }
                    if (client.ccid) {
                        await client.api.subscribe('world.concrnt.t-home@' + client.ccid, sub.id)
                    }

                    const list = {
                        [sub.id]: {
                            pinned: true,
                            expanded: false,
                            defaultPostStreams: timeline ? [timeline] : []
                        }
                    }
                    setLists(list)
                })
        },
        [client]
    )

    useEffect(() => {
        if (noListDetected) {
            client
                .getTimelinesBySchema<CommunityTimelineSchema>(client.host, Schemas.communityTimeline)
                .then((timelines) => {
                    setTimelines(timelines)
                })
        }
    }, [])

    useEffect(() => {
        let unmounted = false
        setAllKnownTimelines([])
        Promise.all(
            Object.keys(lists).map((id) =>
                client.api
                    .getSubscription(id)
                    .then((sub) => {
                        return [id, sub]
                    })
                    .catch((e) => {
                        console.log(e)
                        return [id, null]
                    })
            )
        ).then((subs) => {
            if (unmounted) return
            const validsubsarr = subs.filter((e) => e[1]) as Array<[string, CoreSubscription<any>]>
            const listedSubs = Object.fromEntries(validsubsarr)
            setListedSubscriptions(listedSubs)

            const validsubs = validsubsarr.map((e) => e[1])

            const allTimelines = validsubs.flatMap((sub) => sub.items.map((e) => e.id))
            const uniq = [...new Set(allTimelines)]
            uniq.forEach((id) => {
                client.getTimeline<CommunityTimelineSchema>(id).then((stream) => {
                    if (stream && !unmounted) {
                        setAllKnownTimelines((prev) => [...prev, stream])
                    }
                })
            })
        })

        return () => {
            unmounted = true
        }
    }, [lists])

    const reloadList = useCallback(() => {
        setAllKnownTimelines([])
        Promise.all(
            Object.keys(lists).map((id) =>
                client.api
                    .getSubscription(id)
                    .then((sub) => {
                        return [id, sub]
                    })
                    .catch((e) => {
                        console.log(e)
                        return [id, null]
                    })
            )
        ).then((subs) => {
            const validsubsarr = subs.filter((e) => e[1]) as Array<[string, CoreSubscription<any>]>
            const listedSubs = Object.fromEntries(validsubsarr)
            setListedSubscriptions(listedSubs)

            const validsubs = validsubsarr.map((e) => e[1])

            const allTimelins = validsubs.flatMap((sub) => sub.items.map((e) => e.id))
            const uniq = [...new Set(allTimelins)]
            uniq.forEach((id) => {
                client.getTimeline<CommunityTimelineSchema>(id).then((stream) => {
                    if (stream) {
                        setAllKnownTimelines((prev) => [...prev, stream])
                    }
                })
            })
        })
    }, [client, lists])

    useEffect(() => {
        client.api.getDomain(client.api.host).then((domain) => {
            if (domain === null) {
                setDomainIsOffline(true)
            }
        })
    }, [client.user])

    const openDraft = useCallback(
        (draft?: string) => {
            setDraft(draft ?? '')
            setMode('compose')
        },
        [setDraft, setMode]
    )

    const openReply = useCallback((target: Message<any>) => {
        setTargetMessage(target)
        setMode('reply')
    }, [])

    const openReroute = useCallback(
        (target: Message<any>) => {
            setTargetMessage(target)
            setMode('reroute')
        },
        [setTargetMessage, setMode]
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
                    allKnownTimelines,
                    draft,
                    openEmojipack,
                    openImageViewer,
                    postStreams,
                    setPostStreams,
                    listedSubscriptions,
                    reloadList
                }
            }, [
                openDraft,
                openReply,
                openReroute,
                openMobileMenu,
                allKnownTimelines,
                draft,
                openEmojipack,
                openImageViewer,
                postStreams,
                setPostStreams,
                listedSubscriptions,
                reloadList
            ])}
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
                                                streamPickerInitial={postStreams}
                                                defaultPostHome={isPostStreamsPublic}
                                                streamPickerOptions={allKnownTimelines}
                                                onSubmit={async (text: string, destinations: string[], options) => {
                                                    await client
                                                        .createMarkdownCrnt(text, destinations, options)
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
                                                defaultPostHome={isPostStreamsPublic}
                                                submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                                streamPickerInitial={
                                                    mode === 'reroute' ? postStreams : targetMessage.postedStreams ?? []
                                                }
                                                streamPickerOptions={
                                                    mode === 'reroute'
                                                        ? allKnownTimelines
                                                        : targetMessage.postedStreams ?? []
                                                }
                                                onSubmit={async (text, streams, options): Promise<Error | null> => {
                                                    if (mode === 'reroute') {
                                                        await targetMessage.reroute(streams, text, options)
                                                    } else if (mode === 'reply') {
                                                        await targetMessage.reply(streams, text, options)
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
                                                defaultPostHome={isPostStreamsPublic}
                                                value={draft}
                                                streamPickerInitial={postStreams}
                                                streamPickerOptions={allKnownTimelines}
                                                onSubmit={async (text: string, destinations: string[], options) => {
                                                    await client
                                                        .createMarkdownCrnt(text, destinations, options)
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
                                                defaultPostHome={isPostStreamsPublic}
                                                allowEmpty={mode === 'reroute'}
                                                submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                                streamPickerInitial={
                                                    mode === 'reroute' ? postStreams : targetMessage.postedStreams ?? []
                                                }
                                                streamPickerOptions={
                                                    mode === 'reroute'
                                                        ? allKnownTimelines
                                                        : targetMessage.postedStreams ?? []
                                                }
                                                onSubmit={async (text, streams, options): Promise<Error | null> => {
                                                    if (mode === 'reroute') {
                                                        await targetMessage.reroute(streams, text, options)
                                                    } else if (mode === 'reply') {
                                                        await targetMessage.reply(streams, text, options)
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
                            <ul>{!client?.user?.profile && <li>プロフィールが存在していません</li>}</ul>
                            <ProfileEditor initial={client?.user?.profile} />
                        </Box>
                    </Paper>
                </Modal>

                <Modal open={noListDetected} onClose={() => {}}>
                    <Paper sx={style}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 1,
                                overflowX: 'hidden'
                            }}
                        >
                            <Typography variant="h2" component="div" gutterBottom>
                                コンカレントへようこそ！
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowX: 'hidden',
                                    gap: 2
                                }}
                            >
                                <Typography variant="h3" component="div">
                                    ウォッチするコミュニティを選ぶ(任意)
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        overflowX: 'auto'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flex: 1,
                                            gap: 2,
                                            py: 1
                                        }}
                                    >
                                        {timelines.map((timeline) => (
                                            <StreamCard
                                                key={timeline.id}
                                                streamID={timeline.id}
                                                name={timeline.document.body.name}
                                                description={timeline.document.body.description ?? 'no description'}
                                                banner={timeline.document.body.banner ?? ''}
                                                domain={client.host}
                                                onClick={() => {
                                                    if (selectedTieline === timeline.id) {
                                                        setSelectedTimeline(undefined)
                                                    } else {
                                                        setSelectedTimeline(timeline.id)
                                                    }
                                                }}
                                                sx={{
                                                    outline:
                                                        timeline.id === selectedTieline
                                                            ? `2px solid ${theme.palette.primary.main}`
                                                            : 'none',
                                                    width: '300px'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    onClick={() => {
                                        setupList(selectedTieline)
                                    }}
                                >
                                    はじめる
                                </Button>
                            </Box>
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
