import { useState, useContext, useEffect, useRef, memo } from 'react'
import { InputBase, Box, Button, useTheme, IconButton, Divider, CircularProgress } from '@mui/material'
import { ApplicationContext } from '../App'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import { Schemas } from '../schemas'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import Splitscreen from '@mui/icons-material/Splitscreen'
import ImageIcon from '@mui/icons-material/Image'
import { MarkdownRenderer } from './MarkdownRenderer'
import { StreamPicker } from './StreamPicker'
import { useLocation } from 'react-router-dom'
import { usePersistent } from '../hooks/usePersistent'
import type { SimpleNote } from '../schemas/simpleNote'
import { useApi } from '../context/api'
import { useSnackbar } from 'notistack'

export interface EmojiProps {
    shortcodes: string
}

export interface DraftProps {
    currentStreams: string[]
}

export interface Skin {
    src: string
}

export interface Emoji {
    id: string
    name: string
    keywords: string[]
    skins: Skin[]
}

export interface CustomEmoji {
    id?: string
    name?: string
    emojis?: Emoji[]
    keywords?: string[] | undefined
}

export const Draft = memo<DraftProps>((props: DraftProps): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const api = useApi()
    const theme = useTheme()

    const [draft, setDraft] = useState<string>('')
    const [selectEmoji, setSelectEmoji] = useState<boolean>(false)
    const [customEmoji, setCustomEmoji] = useState<CustomEmoji[]>([])
    const [openPreview, setOpenPreview] = useState<boolean>(false)
    const [messageDestStreams, setMessageDestStreams] = useState<string[]>([])

    const reactlocation = useLocation()
    const inputRef = useRef<HTMLInputElement>(null)

    const [defaultPostHome] = usePersistent<string[]>('defaultPostHome', [])
    const [defaultPostNonHome] = usePersistent<string[]>('defaultPostNonHome', [])

    const [postHome, setPostHome] = useState<boolean>(true)
    const [sending, setSending] = useState<boolean>(false)

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        setMessageDestStreams([
            ...new Set([...(reactlocation.hash ? defaultPostNonHome : defaultPostHome), ...props.currentStreams])
        ])
    }, [reactlocation.hash])

    useEffect(() => {
        const emojis: CustomEmoji[] = [
            {
                id: 'fluffy',
                name: 'Fluffy Social',
                emojis: Object.entries(appData.emojiDict).map(([key, value]) => ({
                    id: key,
                    name: value.name,
                    keywords: value.aliases,
                    skins: [{ src: value.publicUrl }]
                }))
            }
        ]

        setCustomEmoji(emojis)
    }, [appData.emojiDict])

    const post = (): void => {
        if (draft.length === 0 || draft.trim().length === 0) {
            enqueueSnackbar('Message must not be empty!', { variant: 'error' })
            return
        }
        setSending(true)
        const streams = [
            ...new Set([
                ...props.currentStreams,
                ...messageDestStreams,
                ...(postHome ? [appData.userstreams?.payload.body.homeStream] : [])
            ])
        ].filter((e) => e) as string[]
        const body = {
            body: draft
        }

        api.createMessage<SimpleNote>(Schemas.simpleNote, body, streams)
            .then((_) => {
                setDraft('')
                setSending(false)
            })
            .catch((e: Error) => {
                console.log(e.name)
                enqueueSnackbar(e.message, { variant: 'error' })
            })
    }

    const uploadToImgur = async (base64Data: string): Promise<string> => {
        const url = 'https://api.imgur.com/3/image'

        if (!appData.imgurSettings.clientId) return ''

        const result = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Client-ID ${appData.imgurSettings.clientId}`,
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
                borderColor: 'text.disabled'
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
                    <StreamPicker selected={messageDestStreams} setSelected={setMessageDestStreams} />
                </Box>
                <IconButton
                    onClick={() => {
                        setPostHome(!postHome)
                    }}
                >
                    <HomeIcon color={postHome ? 'primary' : 'disabled'} />
                </IconButton>
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
                        width: 1
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
                                overflow: 'scroll'
                            }}
                        >
                            <MarkdownRenderer messagebody={draft} />
                        </Box>
                    </>
                )}
            </Box>
            {selectEmoji && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 150,
                        right: { xs: 10, mb: 90 },
                        zIndex: 9
                    }}
                >
                    <Picker
                        data={data}
                        categories={['fluffy']}
                        custom={customEmoji}
                        searchPosition="static"
                        onEmojiSelect={(emoji: EmojiProps) => {
                            console.log(typeof emoji)
                            setDraft(draft + emoji.shortcodes)
                            setSelectEmoji(false)
                        }}
                    />
                </Box>
            )}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}
            >
                <IconButton
                    sx={{
                        color: theme.palette.text.secondary
                    }}
                    onClick={onFileUploadClick}
                >
                    <ImageIcon />
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
                <IconButton
                    sx={{
                        color: theme.palette.text.secondary
                    }}
                    onClick={() => {
                        setOpenPreview(!openPreview)
                    }}
                >
                    <Splitscreen sx={{ transform: 'rotate(90deg)' }} />
                </IconButton>
                <IconButton
                    sx={{
                        color: theme.palette.text.secondary
                    }}
                    onClick={() => {
                        setSelectEmoji(!selectEmoji)
                    }}
                >
                    <EmojiEmotions />
                </IconButton>
                <Box
                    sx={{
                        position: 'relative'
                    }}
                >
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
                        Send
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
    )
})
Draft.displayName = 'Draft'
