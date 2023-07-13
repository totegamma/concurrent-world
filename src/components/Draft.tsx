import { useState, useContext, useEffect, useRef, memo } from 'react'
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
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material'
import { ApplicationContext } from '../App'
import { MarkdownRenderer } from './MarkdownRenderer'
import { StreamPicker } from './StreamPicker'
import { closeSnackbar, useSnackbar } from 'notistack'
import { usePreference } from '../context/PreferenceContext'
import { usePersistent } from '../hooks/usePersistent'

import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import Splitscreen from '@mui/icons-material/Splitscreen'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { type Emoji, useEmojiPicker } from '../context/EmojiPickerContext'
import caretPosition from 'textarea-caret'

export interface DraftProps {
    submitButtonLabel?: string
    streamPickerInitial: string[]
    onSubmit: (text: string, destinations: string[]) => Promise<Error | null>
    allowEmpty?: boolean
    autoFocus?: boolean
}

export const Draft = memo<DraftProps>((props: DraftProps): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()
    const pref = usePreference()
    const emojiPicker = useEmojiPicker()

    const [destStreams, setDestStreams] = useState<string[]>(props.streamPickerInitial)

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

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        setDestStreams(props.streamPickerInitial)
    }, [props.streamPickerInitial])

    const post = (): void => {
        if (!props.allowEmpty && (draft.length === 0 || draft.trim().length === 0)) {
            enqueueSnackbar('Message must not be empty!', { variant: 'error' })
            return
        }
        const dest = [...new Set([...destStreams, ...(postHome ? [appData.user?.userstreams.homeStream] : [])])].filter(
            (e) => e
        ) as string[]
        setSending(true)
        props
            .onSubmit(draft, dest)
            .then((error) => {
                if (error) {
                    enqueueSnackbar(`Failed to post message: ${error.message}`, { variant: 'error' })
                } else {
                    setDraft('')
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
                        <ListItem dense key={emoji.name} selected={index === selectedSuggestions}>
                            <ListItemIcon>
                                {emoji.skins[0]?.native ? (
                                    <Box>{emoji.skins[0]?.native}</Box>
                                ) : (
                                    <Box
                                        component="img"
                                        src={emoji.skins[0]?.src}
                                        sx={{ width: '1em', height: '1em' }}
                                    />
                                )}
                            </ListItemIcon>
                            <ListItemText>{emoji.name}</ListItemText>
                        </ListItem>
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
                    <StreamPicker selected={destStreams} setSelected={setDestStreams} />
                </Box>
                <Tooltip title={postHome ? 'ホーム同時投稿モード' : 'ストリーム限定投稿モード'} arrow placement="top">
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

                        if (!enableSuggestions) return

                        const pos = caretPosition(e.target, e.target.selectionEnd ?? 0, {})
                        const parent = textInputRef.current?.getBoundingClientRect()
                        const offset = 10
                        if (pos && parent) {
                            setCaretPos({
                                top: parent.top + pos.top + offset,
                                left: parent.left + pos.left + offset
                            })
                            console.log(pos)
                        }
                        let query: string | undefined = draft
                        if (e.target.selectionEnd) {
                            query = draft.slice(0, e.target.selectionEnd)
                        }
                        query = query.split(':').at(-1)
                        if (query) {
                            emojiPicker.search(query).then((result) => {
                                console.log(result)
                                setEmojiSuggestions(result ?? [])
                            })
                        }
                    }}
                    onPaste={handlePasteImage}
                    placeholder="今、なにしてる？"
                    autoFocus={props.autoFocus}
                    sx={{
                        width: 1,
                        fontSize: '0.95rem'
                    }}
                    onKeyDown={(e: any) => {
                        if (e.key === ':') {
                            setEnableSuggestions(!enableSuggestions)
                        }
                        if (enableSuggestions) {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                const before = draft.slice(0, e.target.selectionEnd) ?? ''
                                const colonPos = before.lastIndexOf(':')
                                if (colonPos === -1) return
                                const after = draft.slice(e.target.selectionEnd) ?? ''

                                const emoji = emojiSuggestions[selectedSuggestions].skins[0].native
                                    ? emojiSuggestions[selectedSuggestions].skins[0].native ?? ''
                                    : ':' + emojiSuggestions[selectedSuggestions].name + ':'

                                setDraft(before.slice(0, colonPos) + emoji + after)
                                setSelectedSuggestions(0)
                                setEnableSuggestions(false)
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
                        }
                        if (draft.length === 0 || draft.trim().length === 0) return
                        if (e.key === 'Enter' && (e.ctrlKey === true || e.metaKey === true)) {
                            post()
                        }
                    }}
                    onBlur={() => {
                        if (enableSuggestions) {
                            setEnableSuggestions(false)
                            setSelectedSuggestions(0)
                        }
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
                            <MarkdownRenderer messagebody={draft} />
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
                        title={pref.imgurClientID === '' ? '設定から画像投稿設定をしてください' : '画像の添付'}
                        arrow
                        placement="top"
                        enterDelay={pref.imgurClientID === '' ? 0 : 500}
                    >
                        <span>
                            <IconButton
                                sx={{
                                    color: theme.palette.text.secondary
                                }}
                                onClick={onFileUploadClick}
                                disabled={pref.imgurClientID === ''}
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
                    <Tooltip title="本文をプレビュー" arrow placement="top" enterDelay={500}>
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
                    <Tooltip title="絵文字" arrow placement="top" enterDelay={500}>
                        <IconButton
                            sx={{
                                color: theme.palette.text.secondary
                            }}
                            onClick={(e) => {
                                emojiPicker.open(e.currentTarget, (emoji) => {
                                    setDraft(draft + emoji.shortcodes)
                                    emojiPicker.close()
                                })
                            }}
                        >
                            <EmojiEmotions sx={{ fontSize: '80%' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="下書きを削除" arrow placement="top" enterDelay={500}>
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
