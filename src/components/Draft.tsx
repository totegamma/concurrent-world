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
    ListItemButton
} from '@mui/material'
import { MarkdownRenderer } from './ui/MarkdownRenderer'
import { StreamPicker } from './ui/StreamPicker'
import { closeSnackbar, useSnackbar } from 'notistack'
import { usePreference } from '../context/PreferenceContext'
import { usePersistent } from '../hooks/usePersistent'

import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import Splitscreen from '@mui/icons-material/Splitscreen'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { useEmojiPicker } from '../context/EmojiPickerContext'
import caretPosition from 'textarea-caret'
import { type Stream } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { type Emoji, type EmojiLite } from '../model'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

export interface DraftProps {
    submitButtonLabel?: string
    streamPickerInitial: Stream[]
    streamPickerOptions: Stream[]
    onSubmit: (text: string, destinations: string[], emojis?: Record<string, EmojiLite>) => Promise<Error | null>
    allowEmpty?: boolean
    autoFocus?: boolean
}

export const Draft = memo<DraftProps>((props: DraftProps): JSX.Element => {
    const client = useApi()
    const theme = useTheme()
    const pref = usePreference()
    const emojiPicker = useEmojiPicker()
    const navigate = useNavigate()

    const [destStreams, setDestStreams] = useState<Stream[]>(props.streamPickerInitial)

    const [draft, setDraft] = usePersistent<string>('draft', '')
    const [openPreview, setOpenPreview] = useState<boolean>(false)

    const textInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [postHome, setPostHome] = useState<boolean>(true)
    const [sending, setSending] = useState<boolean>(false)

    const [caretPos, setCaretPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

    const [enableSuggestions, setEnableSuggestions] = useState<boolean>(false)
    const [emojiSuggestions, setEmojiSuggestions] = useState<Emoji[]>([])

    const [selectedSuggestions, setSelectedSuggestions] = useState<number>(0)

    const timerRef = useRef<any | null>(null)

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        setDestStreams(props.streamPickerInitial)
    }, [props.streamPickerInitial])

    const [emojiDict, setEmojiDict] = useState<Record<string, EmojiLite>>({})

    const insertEmoji = (emoji: Emoji): void => {
        const newDraft = draft.slice(0, caretPos.left) + `:${emoji.shortcode}:` + draft.slice(caretPos.left)
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
            ...new Set([...destStreamIDs, ...(postHome ? [client?.user?.userstreams?.homeStream] : [])])
        ].filter((e) => e) as string[]
        setSending(true)
        props
            .onSubmit(draft, dest, emojiDict)
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

    const uploadToImgur = async (base64Data: string): Promise<string> => {
        const url = 'https://api.imgur.com/3/image'

        if (!pref.imgurClientID) return ''

        const result = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Client-ID ${pref.imgurClientID}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'base64',
                image: base64Data.replace(/^data:image\/[a-zA-Z]*;base64,/, '')
            })
        })
        return (await result.json()).data.link
    }

    const handlePasteImage = (event: any): void => {
        const isImage = event.clipboardData?.items[0].type?.includes('image')
        if (isImage) {
            const imageFile = event.clipboardData?.items[0].getAsFile()
            if (imageFile) {
                const uploadingText = ' ![uploading...]()'
                setDraft(draft + uploadingText)

                const URLObj = window.URL || window.webkitURL
                const imgSrc = URLObj.createObjectURL(imageFile)
                console.log(imageFile, imgSrc)
                const reader = new FileReader()
                reader.onload = async (event) => {
                    const base64Text = event
                    if (!base64Text.target) return
                    try {
                        const result = await uploadToImgur(base64Text.target.result as string)
                        setDraft(draft.replace(uploadingText, ''))
                        if (!result) {
                            setDraft(draft + `![upload failed]()`)
                            return
                        }
                        setDraft(draft + `![image](${result})`)
                    } catch (e) {
                        setDraft(draft + `![upload failed]()`)
                    }
                }
                reader.readAsDataURL(imageFile)
            }
        }
    }

    const onFileInputChange = async (event: any): Promise<void> => {
        const file = event.target.files[0]
        if (!file) return
        const URLObj = window.URL || window.webkitURL
        const imgSrc = URLObj.createObjectURL(file)
        console.log(file, imgSrc)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64Text = event
            if (!base64Text.target) return
            console.log(event)
            const result = await uploadToImgur(base64Text.target.result as string)
            if (!result) return
            setDraft(draft + `![image](${result})`)
        }
        reader.readAsDataURL(file)
    }

    const onFileUploadClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
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

    const { t } = useTranslation('', { keyPrefix: 'draft' })

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                borderColor: 'text.disabled',
                width: '100%'
            }}
        >
            <Paper
                sx={{
                    top: `${caretPos.top}px`,
                    left: `${caretPos.left}px`,
                    position: 'fixed',
                    display: enableSuggestions ? 'flex' : 'none',
                    zIndex: 1000
                }}
            >
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
                                <Box component="img" src={emoji.imageURL} sx={{ width: '1em', height: '1em' }} />
                            </ListItemIcon>
                            <ListItemText>{emoji.shortcode}</ListItemText>
                        </ListItemButton>
                    ))}
                </List>
            </Paper>

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
                    px: '10px',
                    gap: 2
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

                        if (!query) {
                            setEnableSuggestions(false)
                            return
                        }

                        setEmojiSuggestions(emojiPicker.search(query))
                        setEnableSuggestions(true)

                        // move suggestion box
                        const pos = caretPosition(e.target, e.target.selectionEnd ?? 0, {})
                        const parent = textInputRef.current?.getBoundingClientRect()
                        const offset = 10
                        if (pos && parent) {
                            setCaretPos({
                                top: parent.top + pos.top + offset,
                                left: parent.left + pos.left + offset
                            })
                        }
                    }}
                    onPaste={handlePasteImage}
                    placeholder={t('placeholder')}
                    autoFocus={props.autoFocus}
                    sx={{
                        width: 1,
                        fontSize: '0.95rem'
                    }}
                    onKeyDown={(e: any) => {
                        if (enableSuggestions && emojiSuggestions.length > 0) {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                onEmojiSuggestConfirm(selectedSuggestions)
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
                                onEmojiSuggestConfirm(0)
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
                {openPreview && (
                    <>
                        <Divider flexItem />
                        <Divider orientation="vertical" flexItem />
                        <Box
                            sx={{
                                width: 1,
                                maxHeight: '171px',
                                overflowY: 'scroll'
                            }}
                        >
                            <MarkdownRenderer messagebody={draft} emojiDict={emojiDict} />
                        </Box>
                    </>
                )}
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
                        title={pref.imgurClientID === '' ? t('cantAttachImage') : t('attachImage')}
                        arrow
                        placement="top"
                        enterDelay={pref.imgurClientID === '' ? 0 : 500}
                    >
                        <span>
                            <IconButton
                                sx={{
                                    color: theme.palette.text.secondary
                                }}
                                onClick={() => {
                                    if (pref.imgurClientID === '') {
                                        navigate('/settings/media')
                                    } else {
                                        onFileUploadClick()
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
                    <Tooltip title={t('preview')} arrow placement="top" enterDelay={500}>
                        <IconButton
                            sx={{
                                color: theme.palette.text.secondary
                            }}
                            onClick={() => {
                                setOpenPreview(!openPreview)
                            }}
                        >
                            <Splitscreen sx={{ transform: 'rotate(90deg)', fontSize: '80%' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('emoji')} arrow placement="top" enterDelay={500}>
                        <IconButton
                            sx={{
                                color: theme.palette.text.secondary
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Box>
                        <Button
                            color="primary"
                            variant="contained"
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
                            {props.submitButtonLabel ?? 'POST'}
                        </Button>
                        {sending && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'primary.main',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px'
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
})
Draft.displayName = 'Draft'
