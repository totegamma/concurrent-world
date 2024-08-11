import { useState, useEffect, useRef, memo } from 'react'
import {
    InputBase,
    Box,
    useTheme,
    Divider,
    CircularProgress,
    Tooltip,
    Collapse,
    Backdrop,
    type SxProps,
    Menu
} from '@mui/material'
import { StreamPicker } from '../ui/StreamPicker'
import { useSnackbar } from 'notistack'
import { usePersistent } from '../../hooks/usePersistent'
import HomeIcon from '@mui/icons-material/Home'
import { type CommunityTimelineSchema, type Timeline, type CreateCurrentOptions } from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import { type Emoji, type EmojiLite } from '../../model'
import { useTranslation } from 'react-i18next'
import { CCIconButton } from '../ui/CCIconButton'
import ReplayIcon from '@mui/icons-material/Replay'
import { EmojiSuggestion } from '../Editor/EmojiSuggestion'
import { UserSuggestion } from '../Editor/UserSuggestion'
import { useStorage } from '../../context/StorageContext'
import { EditorActions } from './EditorActions'
import { EditorPreview } from './EditorPreview'

import { FaMarkdown } from 'react-icons/fa'
import PermMediaIcon from '@mui/icons-material/PermMedia'
import TextFieldsIcon from '@mui/icons-material/TextFields'

export interface CCPostEditorProps {
    autoFocus?: boolean
    mobile?: boolean
    submitButtonLabel?: string
    streamPickerInitial: Array<Timeline<CommunityTimelineSchema>>
    streamPickerOptions: Array<Timeline<CommunityTimelineSchema>>
    onSubmit: (text: string, destinations: string[], options?: CreateCurrentOptions) => Promise<Error | null>
    allowEmpty?: boolean
    placeholder?: string
    sx?: SxProps
    value?: string
    defaultPostHome?: boolean
    minRows?: number
    maxRows?: number
}

type EditorMode = 'plaintext' | 'markdown' | 'media'

const ModeIcons = {
    plaintext: <TextFieldsIcon />,
    markdown: <FaMarkdown />,
    media: <PermMediaIcon />
}

export const CCPostEditor = memo<CCPostEditorProps>((props: CCPostEditorProps): JSX.Element => {
    const theme = useTheme()
    const { client } = useClient()
    const { uploadFile } = useStorage()
    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation('', { keyPrefix: 'ui.draft' })
    const [mode, setMode] = useState<EditorMode>('markdown')
    const [modeMenuAnchor, setModeMenuAnchor] = useState<null | HTMLElement>(null)

    const [destTimelines, setDestTimelines] = useState<Array<Timeline<CommunityTimelineSchema>>>(
        props.streamPickerInitial
    )

    const destinationModified =
        destTimelines.length !== props.streamPickerInitial.length ||
        destTimelines.some((dest, i) => dest.id !== props.streamPickerInitial[i].id)

    const [draft, setDraft] = usePersistent<string>('draft', '')

    const textInputRef = useRef<HTMLInputElement>(null)

    const [postHomeButton, setPostHomeButton] = useState<boolean>(props.defaultPostHome ?? true)
    const [holdCtrlShift, setHoldCtrlShift] = useState<boolean>(false)
    const postHome = postHomeButton && !holdCtrlShift

    let [sending, setSending] = useState<boolean>(false)

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

    const handlePasteImage = async (event: any): Promise<void> => {
        const imageFile = event.clipboardData?.items[0].getAsFile()
        if (!imageFile) return
        await uploadImage(imageFile)
    }

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                borderColor: 'text.disabled',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
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
                    <CCIconButton
                        onClick={(e) => {
                            setModeMenuAnchor(e.currentTarget)
                        }}
                    >
                        {ModeIcons[mode]}
                    </CCIconButton>
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
                    fullWidth
                    value={draft}
                    autoFocus={props.autoFocus}
                    placeholder={props.placeholder ?? t('placeholder')}
                    minRows={props.minRows}
                    maxRows={props.maxRows}
                    onChange={(e) => {
                        setDraft(e.target.value)
                    }}
                    onPaste={(e) => {
                        handlePasteImage(e)
                    }}
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

            {props.mobile ? (
                <>
                    <Collapse
                        unmountOnExit
                        in={draft.length > 0}
                        sx={{
                            maxHeight: '20%',
                            overflowY: 'auto'
                        }}
                    >
                        <Divider
                            sx={{
                                my: 1,
                                borderStyle: 'dashed'
                            }}
                        />
                        <EditorPreview
                            hideActions
                            draft={draft}
                            emojiDict={emojiDict}
                            selectedSubprofile={selectedSubprofile}
                            setSelectedSubprofile={setSelectedSubprofile}
                        />
                    </Collapse>
                    {textInputRef.current && (
                        <>
                            <EmojiSuggestion
                                mobile
                                textInputRef={textInputRef.current}
                                text={draft}
                                setText={setDraft}
                                updateEmojiDict={setEmojiDict}
                            />
                            <UserSuggestion
                                mobile
                                textInputRef={textInputRef.current}
                                text={draft}
                                setText={setDraft}
                            />
                        </>
                    )}
                    <EditorActions
                        post={() => {
                            post(postHome)
                        }}
                        sending={sending}
                        draft={draft}
                        setDraft={setDraft}
                        textInputRef={textInputRef}
                        uploadImage={uploadImage}
                        insertEmoji={insertEmoji}
                        setEmojiDict={setEmojiDict}
                        submitButtonLabel={props.submitButtonLabel}
                    />
                </>
            ) : (
                <>
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
                    <EditorActions
                        post={() => {
                            post(postHome)
                        }}
                        sending={sending}
                        draft={draft}
                        setDraft={setDraft}
                        textInputRef={textInputRef}
                        uploadImage={uploadImage}
                        insertEmoji={insertEmoji}
                        setEmojiDict={setEmojiDict}
                        submitButtonLabel={props.submitButtonLabel}
                    />
                    <Collapse unmountOnExit in={draft.length > 0}>
                        <Divider
                            sx={{
                                my: 1,
                                borderStyle: 'dashed'
                            }}
                        />

                        <EditorPreview
                            draft={draft}
                            emojiDict={emojiDict}
                            selectedSubprofile={selectedSubprofile}
                            setSelectedSubprofile={setSelectedSubprofile}
                        />
                    </Collapse>
                </>
            )}

            <Menu
                anchorEl={modeMenuAnchor}
                open={Boolean(modeMenuAnchor)}
                onClose={() => {
                    setModeMenuAnchor(null)
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.keys(ModeIcons).map((key) => (
                        <CCIconButton
                            key={key}
                            onClick={() => {
                                setMode(key as EditorMode)
                                setModeMenuAnchor(null)
                            }}
                        >
                            {ModeIcons[key as EditorMode]}
                        </CCIconButton>
                    ))}
                </Box>
            </Menu>
        </Box>
    )
})

CCPostEditor.displayName = 'CCEditor'
