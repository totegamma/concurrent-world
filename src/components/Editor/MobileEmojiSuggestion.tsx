import { useCallback, useEffect, useState } from 'react'
import { type Emoji, type EmojiLite } from '../../model'
import { Box, Collapse, List, ListItemButton } from '@mui/material'
import { useEmojiPicker } from '../../context/EmojiPickerContext'

export interface MobileEmojiSuggestionProps {
    textInputRef: HTMLInputElement
    text: string
    setText: (text: string) => void
    updateEmojiDict: (update: (prev: Record<string, EmojiLite>) => Record<string, EmojiLite>) => void
}

export const MobileEmojiSuggestion = (props: MobileEmojiSuggestionProps): JSX.Element => {
    const emojiPicker = useEmojiPicker()

    const ref = props.textInputRef
    const text = props.text
    const cursorPos = ref.selectionEnd ?? 0

    const before = text.slice(0, cursorPos ?? 0) ?? ''
    const query = /:(\w+)$/.exec(before)?.[1]

    const [emojiSuggestions, setEmojiSuggestions] = useState<Emoji[]>([])
    const [selectedSuggestions, setSelectedSuggestions] = useState<number>(0)

    const [forceOff, setForceOff] = useState<boolean>(false)
    const enableSuggestions = query !== undefined && !forceOff

    const onEmojiSuggestConfirm = (index: number): void => {
        const colonPos = before.lastIndexOf(':')
        if (colonPos === -1) return
        const after = text.slice(cursorPos) ?? ''
        const selected = emojiSuggestions[index]

        props.setText(before.slice(0, colonPos) + `:${selected.shortcode}: ` + after)
        setSelectedSuggestions(0)

        props.updateEmojiDict((prev) => ({
            ...prev,
            [selected.shortcode]: { imageURL: selected.imageURL }
        }))
        setForceOff(true)
    }

    useEffect(() => {
        if (!query) return
        setEmojiSuggestions(emojiPicker.search(query))
    }, [query])

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            setForceOff(false)
            if (!enableSuggestions) return
            if (e.key === 'Enter') {
                e.preventDefault()
                onEmojiSuggestConfirm(selectedSuggestions)
            }
        },
        [selectedSuggestions, emojiSuggestions, enableSuggestions]
    )

    const onBlur = useCallback(() => {
        setTimeout(() => {
            setForceOff(true)
        }, 100)
    }, [])

    useEffect(() => {
        props.textInputRef.addEventListener('keydown', onKeyDown)
        props.textInputRef.addEventListener('blur', onBlur)

        return () => {
            props.textInputRef.removeEventListener('keydown', onKeyDown)
            props.textInputRef.removeEventListener('blur', onBlur)
        }
    }, [props.textInputRef, onKeyDown])

    return (
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
    )
}
