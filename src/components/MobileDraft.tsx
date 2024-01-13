import { useState, useEffect, useRef, memo, useContext } from 'react'
import {
    InputBase,
    Box,
    Button,
    useTheme,
    IconButton,
    Tooltip,
    List,
    ListItemButton,
    Divider,
    Typography,
    Collapse
} from '@mui/material'
import { StreamPicker } from './ui/StreamPicker'
import { closeSnackbar, useSnackbar } from 'notistack'
import { usePersistent } from '../hooks/usePersistent'

import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { useEmojiPicker } from '../context/EmojiPickerContext'
import { type CommonstreamSchema, type Stream, type User, type CreateCurrentOptions } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { type Emoji, type EmojiLite } from '../model'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { ApplicationContext } from '../App'
import { useStorage } from '../context/StorageContext'
import { DummyMessageView } from './Message/DummyMessageView'

export interface MobileDraftProps {
    streamPickerInitial: Array<Stream<CommonstreamSchema>>
    streamPickerOptions: Array<Stream<CommonstreamSchema>>
    onSubmit: (text: string, destinations: string[], options?: CreateCurrentOptions) => Promise<Error | null>
    onCancel?: () => void
    submitButtonLabel?: string
    allowEmpty?: boolean
    placeholder?: string
    value?: string
    context?: JSX.Element
}

export const MobileDraft = memo<MobileDraftProps>((props: MobileDraftProps): JSX.Element => {
    const client = useApi()
    const theme = useTheme()
    const { acklist } = useContext(ApplicationContext)
    const emojiPicker = useEmojiPicker()
    const navigate = useNavigate()
    const { uploadFile, isUploadReady } = useStorage()

    const [destStreams, setDestStreams] = useState<Array<Stream<CommonstreamSchema>>>(props.streamPickerInitial)

    const [draft, setDraft] = usePersistent<string>('draft', '')

    const textInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [postHome, setPostHome] = useState<boolean>(true)
    const [sending, setSending] = useState<boolean>(false)

    const [enableSuggestions, setEnableSuggestions] = useState<boolean>(false)
    const [emojiSuggestions, setEmojiSuggestions] = useState<Emoji[]>([])

    const [enableUserPicker, setEnableUserPicker] = useState<boolean>(false)
    const [userSuggestions, setUserSuggestions] = useState<User[]>([])

    const [selectedSuggestions, setSelectedSuggestions] = useState<number>(0)

    const timerRef = useRef<any | null>(null)

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        setDestStreams(props.streamPickerInitial)
    }, [props.streamPickerInitial])

    useEffect(() => {
        if (props.value && props.value !== '') {
            setDraft(props.value)
        }
        textInputRef.current?.setSelectionRange(draft.length, draft.length)
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

    const post = (): void => {
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

        setSending(true)
        props
            .onSubmit(draft, dest, { emojis: emojiDict, mentions })
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

    const uploadImage = async (imageFile: File): Promise<void> => {
        const isImage = imageFile.type.includes('image')
        if (isImage) {
            const uploadingText = ' ![uploading...]()'
            setDraft(draft + uploadingText)
            const result = await uploadFile(imageFile)
            if (!result) {
                setDraft(draft.replace(uploadingText, ''))
                setDraft(draft + `![upload failed]()`)
            } else {
                setDraft(draft.replace(uploadingText, ''))
                setDraft(draft + `![image](${result})`)
            }
        }
    }

    const onFileInputChange = async (event: any): Promise<void> => {
        const file = event.target.files[0]
        if (!file) return
        await uploadImage(file)
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
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'text.disabled',
                width: '100%',
                height: '100%'
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
                        props.onCancel?.()
                    }}
                    sx={{
                        px: 1
                    }}
                >
                    Cancel
                </Button>
            </Box>
            {props.context && (
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
                        {props.context}
                    </Box>
                </>
            )}
            <Divider />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
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
                            setPostHome(!postHome)
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
                    px: 1,
                    flex: 1,
                    cursor: 'text',
                    overflowY: 'auto'
                }}
                onClick={() => {
                    if (textInputRef.current) {
                        textInputRef.current.focus()
                    }
                }}
            >
                <InputBase
                    multiline
                    value={draft}
                    placeholder={props.placeholder ?? t('placeholder')}
                    autoFocus
                    fullWidth
                    sx={{
                        fontSize: '0.95rem'
                    }}
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
                            console.log(acklist, userQuery)
                            setUserSuggestions(
                                acklist.filter((q) =>
                                    q.profile?.payload.body.username?.toLowerCase()?.includes(userQuery)
                                )
                            )
                            setEnableUserPicker(true)
                        }
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
                        if (draft.length === 0 || draft.trim().length === 0) return
                        if (e.key === 'Enter' && (e.ctrlKey === true || e.metaKey === true)) {
                            post()
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
            </Box>
            <Divider
                sx={{
                    my: 1,
                    borderStyle: 'dashed'
                }}
            />
            <Box
                sx={{
                    maxHeight: '20%',
                    overflowY: 'auto'
                }}
            >
                <Collapse in={!enableSuggestions && !enableUserPicker}>
                    <DummyMessageView
                        hideActions
                        message={{
                            body: draft,
                            emojis: emojiDict
                        }}
                        user={client.user?.profile?.payload.body}
                        userCCID={client.user?.ccid}
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
                    />
                </Collapse>
                <Collapse in={enableSuggestions}>
                    <List
                        dense
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 0.5
                        }}
                    >
                        {emojiSuggestions.map((emoji, index) => (
                            <ListItemButton
                                key={emoji.imageURL}
                                selected={index === selectedSuggestions}
                                onClick={() => {
                                    onEmojiSuggestConfirm(index)
                                }}
                                sx={{
                                    p: 0,
                                    width: '2em',
                                    height: '2em',
                                    maxWidth: '2em',
                                    maxHeight: '2em'
                                }}
                            >
                                <Box
                                    component="img"
                                    src={emoji.imageURL}
                                    sx={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
                <Collapse in={enableUserPicker}>
                    <List
                        dense
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                        }}
                    >
                        {userSuggestions.map((user, index) => (
                            <ListItemButton
                                key={user.profile?.payload.body.avatar}
                                selected={index === selectedSuggestions}
                                onClick={() => {
                                    onUserSuggestConfirm(index)
                                }}
                                sx={{
                                    p: 0,
                                    width: '2em',
                                    height: '2em',
                                    maxWidth: '2em',
                                    maxHeight: '2em'
                                }}
                            >
                                <Box
                                    component="img"
                                    src={user.profile?.payload.body.avatar}
                                    sx={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </Box>
            <Divider
                sx={{
                    my: 1
                }}
            />
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
                                    accept={'.png, .jpg, .jpeg, .gif'}
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
                <Button
                    color="primary"
                    disabled={sending}
                    onClick={(_) => {
                        post()
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
    )
})
MobileDraft.displayName = 'Draft'
