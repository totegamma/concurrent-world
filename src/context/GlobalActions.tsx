import { Box, Paper, Modal, Typography, Divider, Button, Drawer, useTheme, useMediaQuery, Tooltip } from '@mui/material'
import { InspectorProvider } from '../context/Inspector'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useClient } from './ClientContext'
import {
    type Message,
    type Timeline,
    type CommunityTimelineSchema,
    Schemas,
    type CoreTimeline
} from '@concurrent-world/client'
import { usePreference } from './PreferenceContext'
import { ProfileEditor } from '../components/ProfileEditor'
import { MessageContainer } from '../components/Message/MessageContainer'
import { Menu } from '../components/Menu/Menu'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type EmojiPackage } from '../model'
import { experimental_VGrid as VGrid } from 'virtua'
import { useSnackbar } from 'notistack'
import { ImagePreviewModal } from '../components/ui/ImagePreviewModal'
import { StreamCard } from '../components/Stream/Card'
import { LogoutButton } from '../components/Settings/LogoutButton'
import { useGlobalState } from './GlobalState'
import { EditorModal } from '../components/EditorModal'

export interface GlobalActionsState {
    openDraft: (text?: string) => void
    openReply: (target: Message<any>) => void
    openReroute: (target: Message<any>) => void
    openMobileMenu: (open?: boolean) => void
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
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    width: '700px',
    maxWidth: '90vw'
}

const RowEmojiCount = 6

export const GlobalActionsProvider = (props: GlobalActionsProps): JSX.Element => {
    const { client } = useClient()
    const globalState = useGlobalState()
    const [lists, setLists] = usePreference('lists')
    const [emojiPackages, setEmojiPackages] = usePreference('emojiPackages')
    const { enqueueSnackbar } = useSnackbar()
    const theme = useTheme()
    const [draft, setDraft] = useState<string>('')
    const [mode, setMode] = useState<'compose' | 'reply' | 'reroute' | 'none'>('none')
    const [targetMessage, setTargetMessage] = useState<Message<any> | null>(null)

    const [postStreams, setPostStreams] = useState<Array<Timeline<CommunityTimelineSchema>>>([])

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
    const [previewImage, setPreviewImage] = useState<string | undefined>()

    const [emojiPack, setEmojiPack] = useState<EmojiPackage>()
    const emojiPackAlreadyAdded = useMemo(() => {
        return emojiPackages.find((p) => p === emojiPack?.packageURL) !== undefined
    }, [emojiPack, emojiPackages])

    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))

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
                    globalState.reloadList()
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

    return (
        <GlobalActionsContext.Provider
            value={useMemo(() => {
                return {
                    openDraft,
                    openReply,
                    openReroute,
                    openMobileMenu,
                    draft,
                    openEmojipack,
                    openImageViewer,
                    postStreams,
                    setPostStreams
                }
            }, [
                openDraft,
                openReply,
                openReroute,
                openMobileMenu,
                draft,
                openEmojipack,
                openImageViewer,
                postStreams,
                setPostStreams
            ])}
        >
            <InspectorProvider>
                <>{props.children}</>
                <EditorModal
                    open={mode !== 'none'}
                    onClose={() => {
                        setMode('none')
                    }}
                    variant={isMobileSize ? 'mobile' : 'desktop'}
                    streamPickerInitial={
                        mode === 'compose'
                            ? postStreams
                            : mode === 'reroute'
                            ? postStreams
                            : targetMessage?.postedStreams?.filter((t) => t.schema === Schemas.communityTimeline) ?? []
                    }
                    streamPickerOptions={globalState.allKnownTimelines}
                    allowEmpty={mode === 'reroute'}
                    submitButtonLabel={mode === 'compose' ? 'Post' : mode === 'reply' ? 'Reply' : 'Reroute'}
                    onSubmit={async (text: string, destinations: string[], options) => {
                        try {
                            if (mode === 'compose') {
                                await client.createMarkdownCrnt(text, destinations, options)
                            } else if (mode === 'reroute') {
                                await targetMessage?.reroute(destinations, text, options)
                            } else if (mode === 'reply') {
                                await targetMessage?.reply(destinations, text, options)
                            }
                            setMode('none')
                            return null
                        } catch (e) {
                            return e as Error
                        }
                    }}
                    onCancel={() => {
                        setMode('none')
                    }}
                    context={
                        targetMessage && (mode === 'reply' || mode === 'reroute') ? (
                            <Box width="100%" maxHeight={isMobileSize ? '3rem' : 'unset'} overflow="auto">
                                <MessageContainer
                                    simple
                                    messageID={targetMessage.id}
                                    messageOwner={targetMessage.author}
                                />
                            </Box>
                        ) : undefined
                    }
                />
                <Modal open={!globalState.isRegistered} onClose={() => {}}>
                    <Paper
                        sx={{
                            ...style,
                            padding: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <Typography variant="h2" component="div">
                            {client.host}に登録情報が見つかりません
                        </Typography>
                        <LogoutButton />
                    </Paper>
                </Modal>
                <Modal
                    open={globalState.isCanonicalUser && setupAccountRequired && globalState.isRegistered}
                    onClose={() => {}}
                >
                    <Paper
                        sx={{
                            ...style,
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
                    </Paper>
                </Modal>

                <Modal open={globalState.isCanonicalUser && noListDetected} onClose={() => {}}>
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
    const actions = useContext(GlobalActionsContext)
    if (!actions) {
        return {
            openDraft: () => {},
            openReply: () => {},
            openReroute: () => {},
            openMobileMenu: () => {},
            draft: '',
            openEmojipack: () => {},
            openImageViewer: () => {},
            postStreams: [],
            setPostStreams: () => {}
        }
    }
    return actions
}
