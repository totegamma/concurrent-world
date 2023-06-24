import { Picker } from 'emoji-mart'
import data from '@emoji-mart/data'
import React, { useContext, useEffect, useRef } from 'react'
import { ApplicationContext } from '../App'

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
}

export const EmojiPicker = ({ onSelected }: EmojiPickerProps): JSX.Element => {
    const appData = useContext(ApplicationContext)

    const ref = useRef<any>(null)
    const instance = useRef<any>(null)

    const onSelectedRef = useRef<(emoji: EmojiProps) => void>(onSelected)

    useEffect(() => {
        console.log('loading emojis...')
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

        instance.current = new Picker({
            categories: ['fluffy'],
            searchPosition: 'static',
            data,
            custom: emojis,
            onEmojiSelect: (emoji: EmojiProps) => {
                onSelectedRef.current(emoji)
            },
            ref
        })

        return () => {
            instance.current = null
        }
    }, [appData.emojiDict])

    useEffect(() => {
        onSelectedRef.current = onSelected
    }, [onSelected])

    return <div ref={ref}></div>
}
