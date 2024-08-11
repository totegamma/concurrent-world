import { useState, useEffect, useRef, memo } from 'react'
import {
    InputBase,
    Box,
    Button,
    useTheme,
    Divider,
    CircularProgress,
    Tooltip,
    ListItemIcon,
    Collapse,
    Fade,
    Typography,
    Backdrop,
    type SxProps,
    Menu,
    MenuItem
} from '@mui/material'
import { StreamPicker } from './ui/StreamPicker'
import { closeSnackbar, useSnackbar } from 'notistack'
import { usePersistent } from '../hooks/usePersistent'

import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import { useEmojiPicker } from '../context/EmojiPickerContext'
import { type CommunityTimelineSchema, type Timeline, type CreateCurrentOptions } from '@concurrent-world/client'
import { useClient } from '../context/ClientContext'
import { type Emoji, type EmojiLite } from '../model'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { DummyMessageView } from './Message/DummyMessageView'

import { useStorage } from '../context/StorageContext'
import { SubprofileBadge } from './ui/SubprofileBadge'
import { CCAvatar } from './ui/CCAvatar'
import { ErrorBoundary } from 'react-error-boundary'

import HeartBrokenIcon from '@mui/icons-material/HeartBroken'
import { CCIconButton } from './ui/CCIconButton'
import ReplayIcon from '@mui/icons-material/Replay'
import { EmojiSuggestion } from './Editor/EmojiSuggestion'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { UserSuggestion } from './Editor/UserSuggestion'

export interface DraftProps {
    submitButtonLabel?: string
    streamPickerInitial: Array<Timeline<CommunityTimelineSchema>>
    streamPickerOptions: Array<Timeline<CommunityTimelineSchema>>
    onSubmit: (text: string, destinations: string[], options?: CreateCurrentOptions) => Promise<Error | null>
    allowEmpty?: boolean
    autoFocus?: boolean
    placeholder?: string
    sx?: SxProps
    value?: string
    defaultPostHome?: boolean
}

export const Draft = memo<DraftProps>((props: DraftProps): JSX.Element => {
    const { client } = useClient()
    const theme = useTheme()
    const emojiPicker = useEmojiPicker()
    const navigate = useNavigate()
    const { uploadFile, isUploadReady } = useStorage()

    const [destTimelines, setDestTimelines] = useState<Array<Timeline<CommunityTimelineSchema>>>(
        props.streamPickerInitial
    )

    const destinationModified =
        destTimelines.length !== props.streamPickerInitial.length ||
        destTimelines.some((dest, i) => dest.id !== props.streamPickerInitial[i].id)

    const [draft, setDraft] = usePersistent<string>('draft', '')
    const [openPreview, setOpenPreview] = useState<boolean>(true)

    const textInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [postHomeButton, setPostHomeButton] = useState<boolean>(props.defaultPostHome ?? true)
    const [holdCtrlShift, setHoldCtrlShift] = useState<boolean>(false)
    const postHome = postHomeButton && !holdCtrlShift

    let [sending, setSending] = useState<boolean>(false)

    const [profileSelectAnchorEl, setProfileSelectAnchorEl] = useState<null | HTMLElement>(null)

    const { enqueueSnackbar } = useSnackbar()

    const [selectedSubprofile, setSelectedSubprofile] = useState<string | undefined>(undefined)

    const [emojiDict, setEmojiDict] = useState<Record<string, EmojiLite>>({})

    const insertEmoji = (emoji: Emoji): void => {
        const newDraft =
            draft.slice(0, textInputRef.current?.selectionEnd ?? 0) +
            `:${emoji.shortcode}:` +
            draft.slice(textInputRef.current?.selectionEnd ?? 0)
        setDraft(newDraft)
        setEmojiDict((prev) => ({ ...prev, [emoji.shortcode]: { imageURL: emoji.imageURL } }))
    }

    useEffect(() => {
        setDestTimelines(props.streamPickerInitial)
    }, [props.streamPickerInitial])

    useEffect(() => {
        if (props.value && props.value !== '') {
            setDraft(props.value)
        }
    }, [props.value])

    const post = (postHome: boolean): void => {
        if (!props.allowEmpty && (draft.length === 0 || draft.trim().length === 0)) {
            enqueueSnackbar('Message must not be empty!', { variant: 'error' })
            return
        }
        if (destTimelines.length === 0 && !postHome) {
            enqueueSnackbar('set destination required', { variant: 'error' })
            return
        }
        const destTimelineIDs = destTimelines.map((s) => s.id)
        const dest = [...new Set([...destTimelineIDs, ...(postHome ? [client?.user?.homeTimeline] : [])])].filter(
            (e) => e
        ) as string[]

        const mentions = draft.match(/@([^\s@]+)/g)?.map((e) => e.slice(1)) ?? []

        setSending((sending = true))
        props
            .onSubmit(draft, dest, {
                emojis: emojiDict,
                mentions,
                profileOverride: { characterID: selectedSubprofile }
            })
            .then((error) => {
                if (error) {
                    enqueueSnackbar(`Failed to post message: ${error.message}`, { variant: 'error' })
                } else {
                    setDraft('')
                    setEmojiDict({})
                }
            })
            .finally(() => {
                setSending(false)
            })
    }

    const handlePasteImage = async (event: any): Promise<void> => {
        const imageFile = event.clipboardData?.items[0].getAsFile()
        if (!imageFile) return
        await uploadImage(imageFile)
    }

    const uploadImage = async (imageFile: File): Promise<void> => {
        const uploadingText = ' ![uploading...]()'
        setDraft(draft + uploadingText)
        const result = await uploadFile(imageFile)
        if (!result) {
            setDraft(draft.replace(uploadingText, ''))
            setDraft(draft + `![upload failed]()`)
        } else {
            setDraft(draft.replace(uploadingText, ''))
            if (imageFile.type.startsWith('video')) {
                setDraft(draft + `<video controls><source src="${result}#t=0.1"></video>`)
            } else {
                setDraft(draft + `![image](${result})`)
            }
        }
    }

    const onFileInputChange = async (event: any): Promise<void> => {
        const file = event.target.files[0]
        if (!file) {
            console.log('no file')
            return
        }
        await uploadImage(file)
        textInputRef.current?.focus()
    }

    const onFileUploadClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const { t } = useTranslation('', { keyPrefix: 'ui.draft' })

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                borderColor: 'text.disabled',
                width: '100%',
                ...props.sx
            }}
        >
            {sending && (
                <Backdrop
                    sx={{
                        position: 'absolute',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        height: '100%',
                        color: '#fff'
                    }}
                    open={sending}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1
                    }}
                >
                    <StreamPicker
                        options={props.streamPickerOptions}
                        selected={destTimelines}
                        setSelected={setDestTimelines}
                    />
                    <CCIconButton
                        sx={{
                            visibility: destinationModified ? 'visible' : 'hidden'
                        }}
                        onClick={() => {
                            setDestTimelines(props.streamPickerInitial)
                        }}
                    >
                        <ReplayIcon />
                    </CCIconButton>
                </Box>
                <Tooltip title={postHome ? t('postToHome') : t('noPostToHome')} arrow placement="top">
                    <CCIconButton
                        onClick={() => {
                            setPostHomeButton(!postHomeButton)
                        }}
                    >
                        <HomeIcon
                            sx={{
                                color: postHome ? 'primary' : theme.palette.text.disabled
                            }}
                        />
                    </CCIconButton>
                </Tooltip>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'start',
                    gap: 2,
                    px: 1
                }}
            >
                <InputBase
                    multiline
                    minRows={3}
                    maxRows={7}
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value)
                    }}
                    onPaste={(e) => {
                        handlePasteImage(e)
                    }}
                    placeholder={props.placeholder ?? t('placeholder')}
                    autoFocus={props.autoFocus}
                    sx={{
                        width: 1,
                        fontSize: '0.95rem'
                    }}
                    onKeyDown={(e: any) => {
                        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                            setHoldCtrlShift(true)
                        }
                        if (draft.length === 0 || draft.trim().length === 0) return
                        if (e.key === 'Enter' && (e.ctrlKey === true || e.metaKey === true) && !sending) {
                            post(postHome)
                        }
                    }}
                    onKeyUp={(e: any) => {
                        if (e.key === 'Shift' || e.key === 'Control') {
                            setHoldCtrlShift(false)
                        }
                    }}
                    inputRef={textInputRef}
                />
            </Box>
            {textInputRef.current && (
                <>
                    <EmojiSuggestion
                        textInputRef={textInputRef.current}
                        text={draft}
                        setText={setDraft}
                        updateEmojiDict={setEmojiDict}
                    />
                    <UserSuggestion textInputRef={textInputRef.current} text={draft} setText={setDraft} />
                </>
            )}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box>
                    <Tooltip
                        title={isUploadReady ? t('attachImage') : t('cantAttachImage')}
                        arrow
                        placement="top"
                        enterDelay={isUploadReady ? 500 : 0}
                    >
                        <span>
                            <CCIconButton
                                onClick={() => {
                                    if (isUploadReady) {
                                        onFileUploadClick()
                                    } else {
                                        navigate('/settings/media')
                                    }
                                }}
                            >
                                <ImageIcon sx={{ fontSize: '80%' }} />
                                <input
                                    hidden
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => {
                                        onFileInputChange(e)
                                    }}
                                    accept={'image/*, video/*'}
                                />
                            </CCIconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={t('emoji')} arrow placement="top" enterDelay={500}>
                        <CCIconButton
                            onClick={(e) => {
                                emojiPicker.open(e.currentTarget, (emoji) => {
                                    insertEmoji(emoji)
                                    emojiPicker.close()
                                    setTimeout(() => {
                                        textInputRef.current?.focus()
                                    }, 0)
                                })
                            }}
                        >
                            <EmojiEmotions sx={{ fontSize: '80%' }} />
                        </CCIconButton>
                    </Tooltip>
                    <Tooltip title={t('clearDraft')} arrow placement="top" enterDelay={500}>
                        <span>
                            <CCIconButton
                                onClick={() => {
                                    if (draft.length === 0) return
                                    enqueueSnackbar('Draft Cleared.', {
                                        autoHideDuration: 5000,
                                        action: (key) => (
                                            <Button
                                                onClick={() => {
                                                    closeSnackbar(key)
                                                    setDraft(draft)
                                                }}
                                            >
                                                undo
                                            </Button>
                                        )
                                    })
                                    setDraft('')
                                    setEmojiDict({})
                                }}
                                disabled={draft.length === 0}
                            >
                                <DeleteIcon sx={{ fontSize: '80%' }} />
                            </CCIconButton>
                        </span>
                    </Tooltip>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Tooltip
                        arrow
                        placement="top"
                        title={openPreview ? t('closePreview') : t('openPreview')}
                        enterDelay={500}
                    >
                        <Fade in={draft.length > 0}>
                            <CCIconButton
                                sx={{
                                    color: 'text.secondary'
                                }}
                                onClick={() => {
                                    setOpenPreview(!openPreview)
                                }}
                            >
                                <ExpandCircleDownIcon
                                    sx={{
                                        fontSize: '80%',
                                        transform: openPreview ? 'rotate(0deg)' : 'rotate(180deg)',
                                        transition: 'transform 0.2s ease-in-out'
                                    }}
                                />
                            </CCIconButton>
                        </Fade>
                    </Tooltip>

                    <Box>
                        <Button
                            color="primary"
                            disabled={sending}
                            onClick={(_) => {
                                post(postHome)
                            }}
                            sx={{
                                '&.Mui-disabled': {
                                    background: theme.palette.divider,
                                    color: theme.palette.text.disabled
                                }
                            }}
                            endIcon={<SendIcon />}
                        >
                            {props.submitButtonLabel ?? t('current')}
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Collapse unmountOnExit in={openPreview && draft.length > 0}>
                <Divider
                    sx={{
                        my: 1,
                        borderStyle: 'dashed'
                    }}
                />

                <ErrorBoundary
                    FallbackComponent={({ error }) => (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 2
                            }}
                        >
                            <Typography
                                color="error"
                                variant="body2"
                                align="center"
                                display="flex"
                                alignItems="center"
                                gap={1}
                            >
                                <HeartBrokenIcon />
                                {error.message}
                            </Typography>
                        </Box>
                    )}
                >
                    <Box
                        sx={{
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}
                    >
                        <DummyMessageView
                            message={{
                                body: draft,
                                emojis: emojiDict
                            }}
                            user={client.user?.profile}
                            userCCID={client.user?.ccid}
                            subprofileID={selectedSubprofile}
                            timestamp={
                                <Typography
                                    sx={{
                                        backgroundColor: 'divider',
                                        color: 'primary.contrastText',
                                        px: 1,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {t('preview')}
                                </Typography>
                            }
                            onAvatarClick={(e) => {
                                setProfileSelectAnchorEl(e.currentTarget)
                            }}
                        />
                    </Box>
                </ErrorBoundary>
            </Collapse>
            <Menu
                anchorEl={profileSelectAnchorEl}
                open={Boolean(profileSelectAnchorEl)}
                onClose={() => {
                    setProfileSelectAnchorEl(null)
                }}
            >
                {selectedSubprofile && (
                    <MenuItem
                        onClick={() => {
                            setSelectedSubprofile(undefined)
                        }}
                        selected
                    >
                        <ListItemIcon>
                            <CCAvatar
                                alt={client?.user?.profile?.username ?? 'Unknown'}
                                avatarURL={client?.user?.profile?.avatar}
                                identiconSource={client?.ccid ?? ''}
                            />
                        </ListItemIcon>
                    </MenuItem>
                )}

                {client.user?.profile?.subprofiles?.map((id) => {
                    if (selectedSubprofile === id) return undefined
                    return (
                        <MenuItem
                            key={id}
                            onClick={() => {
                                setSelectedSubprofile(id)
                            }}
                        >
                            <ListItemIcon>
                                <SubprofileBadge characterID={id} authorCCID={client.user?.ccid ?? ''} />
                            </ListItemIcon>
                        </MenuItem>
                    )
                })}
            </Menu>
        </Box>
    )
})
Draft.displayName = 'Draft'
