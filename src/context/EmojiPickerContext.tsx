import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Popover, TextField, Box, Tabs, Tab, Typography, Divider, IconButton } from '@mui/material'
import { usePreference } from './PreferenceContext'
import { type EmojiPackage, type Emoji } from '../model'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import { usePersistent } from '../hooks/usePersistent'

import Fuse from 'fuse.js'

export interface EmojiPickerState {
    open: (anchor: HTMLElement, onSelected: (selected: Emoji) => void) => void
    close: () => void
    search: (input: string) => Emoji[]
}

const EmojiPickerContext = createContext<EmojiPickerState | undefined>(undefined)

interface EmojiPickerProps {
    children: JSX.Element | JSX.Element[]
}

export const EmojiPickerProvider = (props: EmojiPickerProps): JSX.Element => {
    const pref = usePreference()

    const [anchor, setAnchor] = useState<HTMLElement | null>(null)
    const onSelectedRef = useRef<((selected: Emoji) => void) | null>(null)
    const [frequentEmojis, setFrequentEmojis] = usePersistent<Emoji[]>('FrequentEmojis', [])
    const [query, setQuery] = useState<string>('')
    const [emojiPackages, setEmojiPackages] = useState<EmojiPackage[]>([])
    const [emojiPickerTab, setEmojiPickerTab] = useState<number>(0)
    const [searchResults, setSearchResults] = useState<Emoji[]>([])
    const fuse = useRef<Fuse<Emoji> | null>(null)

    const title: string = useMemo(() => {
        if (query.length > 0) {
            return 'Search Result'
        } else {
            if (emojiPickerTab === 0) {
                return 'Frequently Used'
            } else {
                return emojiPackages[emojiPickerTab - 1].name
            }
        }
    }, [emojiPickerTab, emojiPackages, query])

    const displayEmojis: Emoji[] = useMemo(() => {
        if (query.length > 0) {
            return searchResults
        } else {
            if (emojiPickerTab === 0) {
                return frequentEmojis
            } else {
                return emojiPackages[emojiPickerTab - 1].emojis
            }
        }
    }, [emojiPickerTab, emojiPackages, frequentEmojis, query, searchResults])

    const open = useCallback((anchor: HTMLElement, onSelected: (selected: Emoji) => void) => {
        setAnchor(anchor)
        onSelectedRef.current = onSelected
    }, [])

    const close = useCallback(() => {
        setAnchor(null)
        setQuery('')
        onSelectedRef.current = null
    }, [])

    const search = useCallback((input: string, limit: number = 10) => {
        return fuse.current?.search(input, { limit }).map((e) => e.item) ?? []
    }, [])

    const onSelectEmoji = useCallback(
        (emoji: Emoji) => {
            const newFrequentEmojis = frequentEmojis.filter(
                (frequentEmoji) => frequentEmoji.shortcode !== emoji.shortcode
            )
            newFrequentEmojis.unshift(emoji)
            setFrequentEmojis(newFrequentEmojis.slice(0, 32))
            onSelectedRef.current?.(emoji)
        },
        [frequentEmojis]
    )

    useEffect(() => {
        Promise.all(pref.emojiPackages.map((url) => fetch(url).then((j) => j.json()))).then((packages) => {
            setEmojiPackages(packages)
            fuse.current = new Fuse(
                packages.flatMap((p) => p.emojis),
                {
                    keys: ['shortcode', 'aliases'],
                    threshold: 0.3
                }
            )
        })
    }, [pref.emojiPackages])

    useEffect(() => {
        if (query.length > 0) {
            setSearchResults(fuse.current?.search(query).map((e) => e.item) ?? [])
        } else {
            setSearchResults([])
        }
    }, [query])

    const tabsx = {
        minWidth: '10%'
    }

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
                    PaperProps={{
                        style: {
                            width: 400,
                            height: 400,
                            display: 'flex',
                            flexDirection: 'column'
                        }
                    }}
                >
                    <Box // header
                        display="flex"
                        flexDirection="column"
                    >
                        <Tabs
                            value={emojiPickerTab}
                            onChange={(_, newValue) => {
                                setEmojiPickerTab(newValue)
                            }}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                key="frequent"
                                aria-label="Frequently Used"
                                icon={<AccessTimeFilledIcon />}
                                sx={tabsx}
                            />
                            {emojiPackages.map((emojiPackage) => (
                                <Tab
                                    key={emojiPackage.packageURL}
                                    aria-label={emojiPackage.name}
                                    icon={<img src={emojiPackage.iconURL} alt={emojiPackage.name} height="20px" />}
                                    sx={tabsx}
                                />
                            ))}
                        </Tabs>
                        <Divider />
                        <TextField
                            autoFocus
                            placeholder="Search emoji"
                            onChange={(e) => {
                                setQuery(e.target.value)
                            }}
                            sx={{
                                flexGrow: 1,
                                m: 1
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (displayEmojis.length > 0) {
                                        e.preventDefault()
                                        setAnchor(null)
                                        onSelectEmoji(displayEmojis[0])
                                    }
                                }
                            }}
                        />
                    </Box>
                    <Box // body
                        flexGrow={1}
                        overflow="auto"
                        display="flex"
                        flexDirection="column"
                        padding={1}
                    >
                        <Box // Header
                            display="flex"
                        >
                            <Typography>{title}</Typography>
                        </Box>

                        <Box // Body
                            display="flex"
                            flexWrap="wrap"
                        >
                            {displayEmojis.map((emoji) => (
                                <IconButton
                                    key={emoji.imageURL}
                                    onClick={() => {
                                        onSelectEmoji(emoji)
                                    }}
                                >
                                    <img src={emoji.imageURL} alt={emoji.shortcode} height="30px" width="30px" />
                                </IconButton>
                            ))}
                        </Box>
                    </Box>
                </Popover>
            </>
        </EmojiPickerContext.Provider>
    )
}

export function useEmojiPicker(): EmojiPickerState {
    return useContext(EmojiPickerContext) as EmojiPickerState
}
