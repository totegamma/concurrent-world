import { useCallback, useEffect, useState } from 'react'
import { type Emoji, type EmojiLite } from '../../model'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Popper } from '@mui/material'
import caretPosition from 'textarea-caret'
import { useEmojiPicker } from '../../context/EmojiPickerContext'
import { useActiveElement } from '@react-hooks-library/core'

export interface EmojiSuggestionProps {
    textInputRef: HTMLInputElement
    text: string
    setText: (text: string) => void
    updateEmojiDict: (update: (prev: Record<string, EmojiLite>) => Record<string, EmojiLite>) => void
}

export const EmojiSuggestion = (props: EmojiSuggestionProps): JSX.Element => {
    const emojiPicker = useEmojiPicker()

    const ref = props.textInputRef
    const text = props.text
    const cursorPos = ref.selectionEnd ?? 0

    const caretPos = caretPosition(ref, cursorPos)
    const caretPosOffsetted = {
        top: caretPos.top - 50,
        left: caretPos.left + 10
    }

    const before = text.slice(0, cursorPos ?? 0) ?? ''
    const query = /:(\w+)$/.exec(before)?.[1]

    const [emojiSuggestions, setEmojiSuggestions] = useState<Emoji[]>([])
    const [selectedSuggestions, setSelectedSuggestions] = useState<number>(0)

    const { activeElement } = useActiveElement()
    const enableSuggestions = query !== undefined && activeElement === ref

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
    }

    useEffect(() => {
        if (!query) return
        setEmojiSuggestions(emojiPicker.search(query))
    }, [query])

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enableSuggestions) return
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedSuggestions((selectedSuggestions - 1 + emojiSuggestions.length) % emojiSuggestions.length)
                return
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedSuggestions((selectedSuggestions + 1) % emojiSuggestions.length)
                return
            }
            if (e.key === 'Enter') {
                e.preventDefault()
                onEmojiSuggestConfirm(selectedSuggestions)
            }
        },
        [selectedSuggestions, emojiSuggestions, enableSuggestions]
    )

    useEffect(() => {
        props.textInputRef.addEventListener('keydown', onKeyDown)

        return () => {
            props.textInputRef.removeEventListener('keydown', onKeyDown)
        }
    }, [props.textInputRef, onKeyDown])

    return (
        <>
            <Popper
                open={enableSuggestions}
                anchorEl={props.textInputRef}
                placement="bottom-start"
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [caretPosOffsetted.left, caretPosOffsetted.top]
                        }
                    }
                ]}
                sx={{
                    zIndex: (theme) => theme.zIndex.tooltip + 1
                }}
            >
                <Paper>
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
            </Popper>
        </>
    )
}
