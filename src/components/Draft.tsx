import { useState, useContext, useEffect } from 'react'
import {
    InputBase,
    Box,
    Button,
    useTheme,
    IconButton,
    Divider
} from '@mui/material'
import { Sign } from '../util'
import { ApplicationContext } from '../App'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import { Schemas } from '../schemas'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { EmojiEmotions, Splitscreen } from '@mui/icons-material'
import { MarkdownRenderer } from './MarkdownRenderer'
import { StreamPicker } from './StreamPicker'
import { useLocation } from 'react-router-dom'
import { usePersistent } from '../hooks/usePersistent'

export interface EmojiProps {
    shortcodes: string
}

export interface DraftProps {
    currentStreams: string
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

export function Draft(props: DraftProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()

    const [draft, setDraft] = useState<string>('')
    const [selectEmoji, setSelectEmoji] = useState<boolean>(false)
    const [customEmoji, setCustomEmoji] = useState<CustomEmoji[]>([])
    const [openPreview, setOpenPreview] = useState<boolean>(false)
    const [messageDestStreams, setMessageDestStreams] = useState<string[]>([])

    const reactlocation = useLocation()

    const [defaultPostHome] = usePersistent<string[]>('defaultPostHome', [])
    const [defaultPostNonHome] = usePersistent<string[]>(
        'defaultPostNonHome',
        []
    )

    const [postHome, setPostHome] = useState<boolean>(true)

    useEffect(() => {
        setMessageDestStreams([
            ...new Set([
                ...(reactlocation.hash ? defaultPostNonHome : defaultPostHome),
                ...props.currentStreams.split(',')
            ])
        ])
    }, [reactlocation.hash])

    const post = (): void => {
        const payloadObj = {
            body: draft
        }

        const payload = JSON.stringify(payloadObj)
        const signature = Sign(appData.privatekey, payload)

        const requestOptions = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                author: appData.userAddress,
                payload,
                signature,
                streams: [
                    ...new Set([
                        ...props.currentStreams.split(','),
                        ...messageDestStreams,
                        ...(postHome ? [appData.profile.homestream] : [])
                    ])
                ]
                    .filter((e) => e)
                    .join(','),
                schema: Schemas.simpleNote
            })
        }

        fetch(appData.serverAddress + 'messages', requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setDraft('')
            })
    }

    useEffect(() => {
        const emojis: CustomEmoji[] = [
            {
                id: 'fluffy',
                name: 'Fluffy Social',
                emojis: Object.entries(appData.emojiDict).map(
                    ([key, value]) => ({
                        id: key,
                        name: value.name,
                        keywords: value.aliases,
                        skins: [{ src: value.publicUrl }]
                    })
                )
            }
        ]

        setCustomEmoji(emojis)
    }, [appData.emojiDict])

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
                    <StreamPicker
                        color="none"
                        selected={messageDestStreams}
                        setSelected={setMessageDestStreams}
                    />
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
                    flexDirection: { xs: 'column', md: 'row' }
                }}
            >
                <InputBase
                    multiline
                    minRows={3}
                    maxRows={6}
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value)
                    }}
                    placeholder="今、なにしてる？"
                    sx={{
                        width: 1,
                        padding: '0'
                    }}
                    onKeyDown={(e: any) => {
                        if (draft.length === 0 || draft.trim().length === 0)
                            return
                        if (
                            e.key === 'Enter' &&
                            (e.ctrlKey === true || e.metaKey === true)
                        ) {
                            post()
                        }
                    }}
                />
                {openPreview && (
                    <>
                        <Divider orientation="vertical" />
                        <Box
                            sx={{
                                width: 1,
                                height: '171px',
                                overflow: 'scroll',
                                px: 1
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
                    justifyContent: 'flex-end'
                }}
            >
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
                <Button
                    color="primary"
                    variant="contained"
                    disabled={draft.length === 0 || draft.trim().length === 0}
                    onClick={(_) => {
                        post()
                    }}
                    sx={{
                        padding: '4px 16px',
                        margin: '4px 0 4px 8px',
                        '&.Mui-disabled': {
                            background: theme.palette.divider,
                            color: theme.palette.text.disabled,
                            margin: '4px 0 4px 8px'
                        }
                    }}
                    endIcon={<SendIcon />}
                >
                    Send
                </Button>
            </Box>
        </Box>
    )
}
