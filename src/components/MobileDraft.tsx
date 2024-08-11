import { useState, useEffect, useRef, memo } from 'react'
import { InputBase, Box, Button, useTheme, Tooltip, Divider, Typography } from '@mui/material'
import { StreamPicker } from './ui/StreamPicker'
import { closeSnackbar, useSnackbar } from 'notistack'
import { usePersistent } from '../hooks/usePersistent'

import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { useEmojiPicker } from '../context/EmojiPickerContext'
import { type CommunityTimelineSchema, type Timeline, type CreateCurrentOptions } from '@concurrent-world/client'
import { useClient } from '../context/ClientContext'
import { type Emoji, type EmojiLite } from '../model'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { useStorage } from '../context/StorageContext'
import { DummyMessageView } from './Message/DummyMessageView'
import { CCIconButton } from './ui/CCIconButton'
import { MobileEmojiSuggestion } from './Editor/MobileEmojiSuggestion'
import { MobileUserSuggestion } from './Editor/MobileUserSuggestion'

export interface MobileDraftProps {
    streamPickerInitial: Array<Timeline<CommunityTimelineSchema>>
    streamPickerOptions: Array<Timeline<CommunityTimelineSchema>>
    onSubmit: (text: string, destinations: string[], options?: CreateCurrentOptions) => Promise<Error | null>
    onCancel?: () => void
    submitButtonLabel?: string
    allowEmpty?: boolean
    placeholder?: string
    value?: string
    context?: JSX.Element
    defaultPostHome?: boolean
}

export const MobileDraft = memo<MobileDraftProps>((props: MobileDraftProps): JSX.Element => {
    const { client } = useClient()
    const theme = useTheme()
    const emojiPicker = useEmojiPicker()
    const navigate = useNavigate()
    const { uploadFile, isUploadReady } = useStorage()

    const [destStreams, setDestStreams] = useState<Array<Timeline<CommunityTimelineSchema>>>(props.streamPickerInitial)

    const [draft, setDraft] = usePersistent<string>('draft', '')

    const textInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [postHome, setPostHome] = useState<boolean>(props.defaultPostHome ?? true)
    const [sending, setSending] = useState<boolean>(false)

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
        const dest = [...new Set([...destStreamIDs, ...(postHome ? [client?.user?.homeTimeline] : [])])].filter(
            (e) => e
        ) as string[]

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
        if (!file) return
        await uploadImage(file)
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
                    <CCIconButton
                        onClick={() => {
                            setPostHome(!postHome)
                        }}
                    >
                        <HomeIcon color={postHome ? 'primary' : 'disabled'} />
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
                    value={draft}
                    placeholder={props.placeholder ?? t('placeholder')}
                    autoFocus
                    fullWidth
                    sx={{
                        fontSize: '0.95rem'
                    }}
                    onChange={(e) => {
                        setDraft(e.target.value)
                    }}
                    onKeyDown={(e: any) => {
                        if (draft.length === 0 || draft.trim().length === 0) return
                        if (e.key === 'Enter' && (e.ctrlKey === true || e.metaKey === true)) {
                            post()
                        }
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
                <DummyMessageView
                    hideActions
                    message={{
                        body: draft,
                        emojis: emojiDict
                    }}
                    user={client.user?.profile}
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
                {textInputRef.current && (
                    <>
                        <MobileEmojiSuggestion
                            textInputRef={textInputRef.current}
                            text={draft}
                            setText={setDraft}
                            updateEmojiDict={setEmojiDict}
                        />
                        <MobileUserSuggestion textInputRef={textInputRef.current} text={draft} setText={setDraft} />
                    </>
                )}
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
