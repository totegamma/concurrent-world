import Picker from '@emoji-mart/react'
import { init, SearchIndex } from 'emoji-mart'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ApplicationContext } from '../App'
import { Popover, type PopoverActions } from '@mui/material'

export interface EmojiPickerState {
    open: (anchor: HTMLElement, onSelected: (selected: EmojiProps) => void) => void
    close: () => void
    search: (input: string) => Promise<Emoji[]>
}

const EmojiPickerContext = createContext<EmojiPickerState | undefined>(undefined)

interface EmojiPickerProps {
    children: JSX.Element | JSX.Element[]
}

// emoji returned from onEmojiSelect
export interface EmojiProps {
    id: string
    keywords: string[]
    name: string
    native: string
    shortcodes: string
    src: string
}

export interface Skin {
    src: string
    native?: string
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

export const EmojiPickerProvider = (props: EmojiPickerProps): JSX.Element => {
    const appData = useContext(ApplicationContext)

    const [anchor, setAnchor] = useState<HTMLElement | null>(null)
    const onSelectedRef = useRef<((selected: EmojiProps) => void) | null>(null)
    const repositionEmojiPicker = useRef<PopoverActions | null>(null)

    const open = useMemo(
        () => (anchor: HTMLElement, onSelected: (selected: EmojiProps) => void) => {
            setAnchor(anchor)
            onSelectedRef.current = onSelected
        },
        []
    )

    const close = useMemo(
        () => () => {
            setAnchor(null)
            onSelectedRef.current = null
        },
        []
    )

    const emojis: CustomEmoji[] = useMemo(() => {
        if (!appData.emojiDict) return []
        const data = [
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
        init({
            custom: data
        })
        return data
    }, [appData.emojiDict])

    const search = useCallback((input: string) => {
        console.log('search!', input)
        return SearchIndex.search(input, { maxResults: 6, caller: self })
    }, [])

    useEffect(() => {
        // XXX: this is a hack to make sure the emoji picker is repositioned after it is opened
        const timer = setTimeout(() => {
            repositionEmojiPicker.current?.updatePosition()
        }, 0)
        return () => {
            clearTimeout(timer)
        }
    }, [repositionEmojiPicker.current, anchor])

    return (
        <EmojiPickerContext.Provider
            value={useMemo(() => {
                return {
                    open,
                    close,
                    search
                }
            }, [open, close, search])}
        >
            <>
                {props.children}
                <Popover
                    open={!!anchor}
                    anchorEl={anchor}
                    onClose={() => {
                        close()
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    action={repositionEmojiPicker}
                >
                    <Picker
                        categories={['frequent', 'fluffy']}
                        custom={emojis}
                        autoFocus={true}
                        onEmojiSelect={(emoji: EmojiProps) => {
                            onSelectedRef.current?.(emoji)
                        }}
                    />
                </Popover>
            </>
        </EmojiPickerContext.Provider>
    )
}

export function useEmojiPicker(): EmojiPickerState {
    return useContext(EmojiPickerContext) as EmojiPickerState
}
