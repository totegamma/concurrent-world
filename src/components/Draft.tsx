import { useState, useEffect, useRef, memo } from 'react'
import {
    InputBase,
    Box,
    Button,
    useTheme,
    IconButton,
    Divider,
    CircularProgress,
    Tooltip,
    Paper,
    List,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Collapse,
    Fade,
    Typography,
    Backdrop,
    type SxProps,
    Popper,
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
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { useEmojiPicker } from '../context/EmojiPickerContext'
import caretPosition from 'textarea-caret'
import { type CommonstreamSchema, type Stream, type User, type CreateCurrentOptions } from '@concurrent-world/client'
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

export interface DraftProps {
    submitButtonLabel?: string
    streamPickerInitial: Array<Stream<CommonstreamSchema>>
    streamPickerOptions: Array<Stream<CommonstreamSchema>>
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

    const [destStreams, setDestStreams] = useState<Array<Stream<CommonstreamSchema>>>(props.streamPickerInitial)

    const [draft, setDraft] = usePersistent<string>('draft', '')
    const [openPreview, setOpenPreview] = useState<boolean>(true)

    const textInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [postHomeButton, setPostHomeButton] = useState<boolean>(props.defaultPostHome ?? true)
    const [holdCtrlShift, setHoldCtrlShift] = useState<boolean>(false)
    const postHome = postHomeButton && !holdCtrlShift

    let [sending, setSending] = useState<boolean>(false)

    const [caretPos, setCaretPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

    const [enableSuggestions, setEnableSuggestions] = useState<boolean>(false)
    const [emojiSuggestions, setEmojiSuggestions] = useState<Emoji[]>([])

    const [enableUserPicker, setEnableUserPicker] = useState<boolean>(false)
    const [userSuggestions, setUserSuggestions] = useState<User[]>([])

    const [selectedSuggestions, setSelectedSuggestions] = useState<number>(0)

    const [profileSelectAnchorEl, setProfileSelectAnchorEl] = useState<null | HTMLElement>(null)

    const timerRef = useRef<any | null>(null)

    const { enqueueSnackbar } = useSnackbar()

    const [selectedSubprofile, setSelectedSubprofile] = useState<string | undefined>(undefined)

    useEffect(() => {
        setDestStreams(props.streamPickerInitial)
    }, [props.streamPickerInitial])

    useEffect(() => {
        if (props.value && props.value !== '') {
            setDraft(props.value)
        }
    }, [props.value])

    const [emojiDict, setEmojiDict] = useState<Record<string, EmojiLite>>({})

    const insertEmoji = (emoji: Emoji): void => {
        const newDraft =
            draft.slice(0, textInputRef.current?.selectionEnd ?? 0) +
            `:${emoji.shortcode}:` +
            draft.slice(textInputRef.current?.selectionEnd ?? 0)
        setDraft(newDraft)
        setEnableSuggestions(false)
        setSelectedSuggestions(0)
        setEmojiDict((prev) => ({ ...prev, [emoji.shortcode]: { imageURL: emoji.imageURL } }))
    }

    const post = (postHome: boolean): void => {
        if (!props.allowEmpty && (draft.length === 0 || draft.trim().length === 0)) {
            enqueueSnackbar('Message must not be empty!', { variant: 'error' })
            return
        }
        if (destStreams.length === 0 && !postHome) {
            enqueueSnackbar('set destination required', { variant: 'error' })
            return
        }
        const destStreamIDs = destStreams.map((s) => s.id)
        const dest = [
            ...new Set([...destStreamIDs, ...(postHome ? [client?.user?.userstreams?.payload.body.homeStream] : [])])
        ].filter((e) => e) as string[]

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
                setDraft(draft + `<video controls><source src="${result}" type="${imageFile.type}"></video>`)
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

    const onSuggestConfirm = (index: number): void => {
        if (enableSuggestions) {
            onEmojiSuggestConfirm(index)
        } else if (enableUserPicker) {
            onUserSuggestConfirm(index)
        }
    }

    const onEmojiSuggestConfirm = (index: number): void => {
        console.log('confirm', index)
        const before = draft.slice(0, textInputRef.current?.selectionEnd ?? 0) ?? ''
        const colonPos = before.lastIndexOf(':')
        if (colonPos === -1) return
        const after = draft.slice(textInputRef.current?.selectionEnd ?? 0) ?? ''

        const selected = emojiSuggestions[index]

        setDraft(before.slice(0, colonPos) + `:${selected.shortcode}:` + after)
        setSelectedSuggestions(0)
        setEnableSuggestions(false)

        setEmojiDict((prev) => ({
            ...prev,
            [selected.shortcode]: { imageURL: selected.imageURL }
        }))

        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
            textInputRef.current?.focus()
        }
    }

    const onUserSuggestConfirm = (index: number): void => {
        console.log('user confirm', index)
        const before = draft.slice(0, textInputRef.current?.selectionEnd ?? 0) ?? ''
        const colonPos = before.lastIndexOf('@')
        if (colonPos === -1) return
        const after = draft.slice(textInputRef.current?.selectionEnd ?? 0) ?? ''

        const selected = userSuggestions[index]

        setDraft(before.slice(0, colonPos) + `@${selected.ccid} ` + after)
        setEnableUserPicker(false)

        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
            textInputRef.current?.focus()
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1
                    }}
                >
                    <StreamPicker
                        options={props.streamPickerOptions}
                        selected={destStreams}
                        setSelected={setDestStreams}
                    />
                </Box>
                <Tooltip title={postHome ? t('postToHome') : t('noPostToHome')} arrow placement="top">
                    <IconButton
                        onClick={() => {
                            setPostHomeButton(!postHomeButton)
                        }}
                    >
                        <HomeIcon color={postHome ? 'primary' : 'disabled'} />
                    </IconButton>
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

                        const before = e.target.value.slice(0, e.target.selectionEnd ?? 0) ?? ''
                        const query = /:(\w+)$/.exec(before)?.[1]
                        const userQuery = /@([^\s@]+)$/.exec(before)?.[1]

                        if (!query) {
                            setEnableSuggestions(false)
                        }

                        if (!userQuery) {
                            setEnableUserPicker(false)
                        }

                        if (!query && !userQuery) {
                            return
                        }

                        if (query) {
                            setEmojiSuggestions(emojiPicker.search(query))
                            setEnableSuggestions(true)
                        }

                        if (userQuery) {
                            setUserSuggestions(
                                client.ackings?.filter((q) =>
                                    q.profile?.payload.body.username?.toLowerCase()?.includes(userQuery)
                                ) ?? []
                            )
                            setEnableUserPicker(true)
                        }

                        // move suggestion box
                        const pos = caretPosition(e.target, e.target.selectionEnd ?? 0, {})
                        if (pos) {
                            setCaretPos({
                                top: pos.top - 50,
                                left: pos.left + 10
                            })
                        }
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
                        if (
                            (enableSuggestions && emojiSuggestions.length > 0) ||
                            (enableUserPicker && userSuggestions.length > 0)
                        ) {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                onSuggestConfirm(selectedSuggestions)
                                return
                            }
                            if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                setSelectedSuggestions(
                                    (selectedSuggestions - 1 + emojiSuggestions.length) % emojiSuggestions.length
                                )
                                return
                            }
                            if (e.key === 'ArrowDown') {
                                e.preventDefault()
                                setSelectedSuggestions((selectedSuggestions + 1) % emojiSuggestions.length)
                                return
                            }
                            if (e.key === ':') {
                                e.preventDefault()
                                onSuggestConfirm(0)
                            }
                        }
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
                    onBlur={() => {
                        timerRef.current = setTimeout(() => {
                            if (enableSuggestions) {
                                setEnableSuggestions(false)
                                setSelectedSuggestions(0)
                            }
                        }, 100)
                    }}
                    inputRef={textInputRef}
                />
                <Popper
                    open={enableSuggestions}
                    anchorEl={textInputRef.current ?? undefined}
                    placement="bottom-start"
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [caretPos.left, caretPos.top]
                            }
                        }
                    ]}
                    sx={{
                        zIndex: (theme) => theme.zIndex.tooltip + 1
                    }}
                >
                    <Paper>
                        <List dense>
                            {emojiSuggestions.map((emoji, index) => (
                                <ListItemButton
                                    dense
                                    key={emoji.imageURL}
                                    selected={index === selectedSuggestions}
                                    onClick={() => {
                                        onEmojiSuggestConfirm(index)
                                    }}
                                >
                                    <ListItemIcon>
                                        <Box
                                            component="img"
                                            src={emoji.imageURL}
                                            sx={{ width: '1em', height: '1em' }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText>{emoji.shortcode}</ListItemText>
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Popper>
                <Popper
                    open={enableUserPicker}
                    anchorEl={textInputRef.current ?? undefined}
                    placement="bottom-start"
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [caretPos.left, caretPos.top]
                            }
                        }
                    ]}
                    sx={{
                        zIndex: (theme) => theme.zIndex.tooltip + 1
                    }}
                >
                    <Paper>
                        <List dense>
                            {userSuggestions.map((user, index) => (
                                <ListItemButton
                                    dense
                                    key={user.profile?.payload.body.avatar}
                                    selected={index === selectedSuggestions}
                                    onClick={() => {
                                        onUserSuggestConfirm(index)
                                    }}
                                >
                                    <ListItemIcon>
                                        <Box
                                            component="img"
                                            src={user.profile?.payload.body.avatar}
                                            sx={{ width: '1em', height: '1em' }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText>{user.profile?.payload.body.username}</ListItemText>
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Popper>
            </Box>
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
                            <IconButton
                                sx={{
                                    color: theme.palette.text.secondary
                                }}
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
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={t('emoji')} arrow placement="top" enterDelay={500}>
                        <IconButton
                            sx={{
                                color: 'text.secondary'
                            }}
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
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('clearDraft')} arrow placement="top" enterDelay={500}>
                        <span>
                            <IconButton
                                sx={{
                                    color: theme.palette.text.secondary
                                }}
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
                            </IconButton>
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
                            <IconButton
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
                            </IconButton>
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
                    <DummyMessageView
                        message={{
                            body: draft,
                            emojis: emojiDict
                        }}
                        user={client.user?.profile?.payload.body}
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
                                alt={client?.user?.profile?.payload.body.username ?? 'Unknown'}
                                avatarURL={client?.user?.profile?.payload.body.avatar}
                                identiconSource={client?.ccid ?? ''}
                            />
                        </ListItemIcon>
                    </MenuItem>
                )}

                {client.user?.profile?.payload.body.subprofiles?.map((id) => {
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
