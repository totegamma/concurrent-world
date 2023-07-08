import { useState, useContext, useEffect, useRef, memo } from 'react'
import {
    InputBase,
    Box,
    Button,
    useTheme,
    IconButton,
    Divider,
    CircularProgress,
    Popover,
    Tooltip
} from '@mui/material'
import { ApplicationContext } from '../App'
import { MarkdownRenderer } from './MarkdownRenderer'
import { StreamPicker } from './StreamPicker'
import { closeSnackbar, useSnackbar } from 'notistack'
import { EmojiPicker } from './EmojiPicker'
import { usePreference } from '../context/PreferenceContext'
import { usePersistent } from '../hooks/usePersistent'

import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import Splitscreen from '@mui/icons-material/Splitscreen'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'

export interface DraftProps {
    submitButtonLabel?: string
    streamPickerInitial: string[]
    onSubmit: (text: string, destinations: string[]) => Promise<Error | null>
    allowEmpty?: boolean
}

export const Draft = memo<DraftProps>((props: DraftProps): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()
    const pref = usePreference()

    const [destStreams, setDestStreams] = useState<string[]>(props.streamPickerInitial)
    const [selectEmoji, setSelectEmoji] = useState<boolean>(false)
    const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null)

    const [draft, setDraft] = usePersistent<string>('draft', '')
    const [openPreview, setOpenPreview] = useState<boolean>(false)

    const inputRef = useRef<HTMLInputElement>(null)

    const [postHome, setPostHome] = useState<boolean>(true)
    const [sending, setSending] = useState<boolean>(false)

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        setDestStreams(props.streamPickerInitial)
    }, [props.streamPickerInitial])

    const post = (): void => {
        if (!props.allowEmpty && (draft.length === 0 || draft.trim().length === 0)) {
            enqueueSnackbar('Message must not be empty!', { variant: 'error' })
            return
        }
        const dest = [
            ...new Set([...destStreams, ...(postHome ? [appData.userstreams?.payload.body.homeStream] : [])])
        ].filter((e) => e) as string[]
        setSending(true)
        props.onSubmit(draft, dest).then((error) => {
            if (error) {
                enqueueSnackbar(`Failed to post message: ${error.message}`, { variant: 'error' })
                setSending(false)
            } else {
                setDraft('')
                setSending(false)
            }
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
        if (inputRef.current) {
            inputRef.current.click()
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
                    }}
                    onPaste={handlePasteImage}
                    placeholder="今、なにしてる？"
                    sx={{
                        width: 1,
                        fontSize: '0.95rem'
                    }}
                    onKeyDown={(e: any) => {
                        if (draft.length === 0 || draft.trim().length === 0) return
                        if (e.key === 'Enter' && (e.ctrlKey === true || e.metaKey === true)) {
                            post()
                        }
                    }}
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
            <Popover
                open={selectEmoji}
                anchorEl={emojiAnchor}
                onClose={() => {
                    setSelectEmoji(false)
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
            >
                <EmojiPicker
                    onSelected={(emoji) => {
                        setDraft(draft + emoji.shortcodes)
                    }}
                />
            </Popover>
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
                                    ref={inputRef}
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
                                setSelectEmoji(!selectEmoji)
                                setEmojiAnchor(e.currentTarget)
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
