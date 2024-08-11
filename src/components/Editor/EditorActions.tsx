import { Box, Button, Tooltip, useTheme } from '@mui/material'
import { CCIconButton } from '../ui/CCIconButton'

import { closeSnackbar, useSnackbar } from 'notistack'
import { useEmojiPicker } from '../../context/EmojiPickerContext'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '../../context/StorageContext'

import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import EmojiEmotions from '@mui/icons-material/EmojiEmotions'
import { type Dispatch, type SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type Emoji, type EmojiLite } from '../../model'

export interface EditorActionsProps {
    post: () => void
    sending: boolean
    draft: string
    setDraft: (draft: string) => void
    textInputRef: React.RefObject<HTMLInputElement>
    uploadImage: (file: File) => Promise<void>
    insertEmoji: (emoji: Emoji) => void
    setEmojiDict: Dispatch<SetStateAction<Record<string, EmojiLite>>>
    submitButtonLabel?: string
}

export const EditorActions = (props: EditorActionsProps): JSX.Element => {
    const theme = useTheme()
    const { t } = useTranslation('', { keyPrefix: 'ui.draft' })
    const emojiPicker = useEmojiPicker()
    const navigate = useNavigate()

    const { isUploadReady } = useStorage()

    const { enqueueSnackbar } = useSnackbar()

    const fileInputRef = useRef<HTMLInputElement>(null)

    const onFileInputChange = async (event: any): Promise<void> => {
        const file = event.target.files[0]
        if (!file) {
            console.log('no file')
            return
        }
        await props.uploadImage(file)
        props.textInputRef.current?.focus()
    }

    const onFileUploadClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    return (
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
                                props.insertEmoji(emoji)
                                emojiPicker.close()
                                setTimeout(() => {
                                    props.textInputRef.current?.focus()
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
                                if (props.draft.length === 0) return
                                enqueueSnackbar('Draft Cleared.', {
                                    autoHideDuration: 5000,
                                    action: (key) => (
                                        <Button
                                            onClick={() => {
                                                closeSnackbar(key)
                                                props.setDraft(props.draft)
                                            }}
                                        >
                                            undo
                                        </Button>
                                    )
                                })
                                props.setDraft('')
                                props.setEmojiDict({})
                            }}
                            disabled={props.draft.length === 0}
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
                <Box>
                    <Button
                        color="primary"
                        disabled={props.sending}
                        onClick={(_) => {
                            props.post()
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
    )
}
