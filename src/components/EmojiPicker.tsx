import { useContext, useEffect, useRef } from 'react'
import { ApplicationContext } from '../App'

// import { Picker } from 'emoji-mart'

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

export interface EmojiPickerProps {
    onSelected: (emoji: EmojiProps) => void
    onMounted?: () => void
}

export const EmojiPicker = ({ onSelected, onMounted }: EmojiPickerProps): JSX.Element => {
    const appData = useContext(ApplicationContext)

    const ref = useRef<any>(null)
    const instance = useRef<any>(null)

    const onSelectedRef = useRef<(emoji: EmojiProps) => void>(onSelected)

    useEffect(() => {
        let unmounted = false
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

        const loadPicker = async (): Promise<void> => {
            const { Picker } = await import('emoji-mart')
            const data = (await import('@emoji-mart/data')).default
            if (unmounted) return
            instance.current = new Picker({
                categories: ['frequent', 'fluffy'],
                searchPosition: 'static',
                maxFrequentRows: 1,
                data,
                custom: emojis,
                autoFocus: true,
                onEmojiSelect: (emoji: EmojiProps) => {
                    onSelectedRef.current(emoji)
                },
                ref
            })
            setTimeout(() => {
                onMounted?.()
            }, 1)
        }

        loadPicker()

        return () => {
            unmounted = true
        }
    }, [appData.emojiDict])

    useEffect(() => {
        onSelectedRef.current = onSelected
    }, [onSelected])

    return ref ? <div ref={ref}></div> : <>loading</>
}
