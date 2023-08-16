import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Popover, TextField, type PopoverActions, Box, Tabs, Tab, Typography, Divider, IconButton } from '@mui/material'
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
    const repositionEmojiPicker = useRef<PopoverActions | null>(null)
    const [frequentEmojis, setFrequentEmojis] = usePersistent<Emoji[]>('FrequentEmojis', [])
    const [query, setQuery] = useState<string>('')
    const [emojiPackages, setEmojiPackages] = useState<EmojiPackage[]>([])
    const [emojiPickerTab, setEmojiPickerTab] = useState<number>(0)
    const [searchResults, setSearchResults] = useState<Emoji[]>([])
    const fuse = useRef<Fuse<Emoji> | null>(null)

    const open = useMemo(
        () => (anchor: HTMLElement, onSelected: (selected: Emoji) => void) => {
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

    const search = useCallback((input: string) => {
        return fuse.current?.search(input).map((e) => e.item) ?? []
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
                            <Tab key="frequent" aria-label="Frequently Used" icon={<AccessTimeFilledIcon />} />
                            {emojiPackages.map((emojiPackage) => (
                                <Tab
                                    key={emojiPackage.packageURL}
                                    aria-label={emojiPackage.name}
                                    icon={<img src={emojiPackage.iconURL} alt={emojiPackage.name} height="20px" />}
                                />
                            ))}
                        </Tabs>
                        <Divider />
                        <TextField
                            placeholder="Search emoji"
                            onChange={(e) => {
                                setQuery(e.target.value)
                            }}
                            sx={{
                                flexGrow: 1,
                                m: 1
                            }}
                            autoFocus
                        />
                    </Box>
                    <Box // body
                        flexGrow={1}
                        overflow="auto"
                        display="flex"
                        flexDirection="column"
                        padding={1}
                    >
                        {query.length > 0 ? (
                            <>
                                <Box // Header
                                    display="flex"
                                >
                                    <Typography>Search Result</Typography>
                                </Box>

                                <Box // Body
                                    display="flex"
                                    flexWrap="wrap"
                                >
                                    {searchResults.map((emoji) => (
                                        <IconButton
                                            key={emoji.imageURL}
                                            onClick={() => {
                                                onSelectEmoji(emoji)
                                            }}
                                        >
                                            <img
                                                src={emoji.imageURL}
                                                alt={emoji.shortcode}
                                                height="30px"
                                                width="30px"
                                            />
                                        </IconButton>
                                    ))}
                                </Box>
                            </>
                        ) : (
                            <>
                                {emojiPickerTab === 0 && (
                                    <>
                                        <Box // Header
                                            display="flex"
                                        >
                                            <Typography>Frequently Used</Typography>
                                        </Box>
                                        <Box // Body
                                            display="flex"
                                            flexWrap="wrap"
                                        >
                                            {frequentEmojis.map((emoji) => (
                                                <IconButton
                                                    key={emoji.imageURL}
                                                    onClick={() => {
                                                        onSelectEmoji(emoji)
                                                    }}
                                                >
                                                    <img
                                                        src={emoji.imageURL}
                                                        alt={emoji.shortcode}
                                                        height="30px"
                                                        width="30px"
                                                    />
                                                </IconButton>
                                            ))}
                                        </Box>
                                    </>
                                )}
                                {emojiPickerTab !== 0 && (
                                    <>
                                        <Box // Header
                                            display="flex"
                                        >
                                            <Typography>{emojiPackages[emojiPickerTab - 1].name}</Typography>
                                        </Box>

                                        <Box // Body
                                            display="flex"
                                            flexWrap="wrap"
                                        >
                                            {emojiPackages[emojiPickerTab - 1].emojis.map((emoji) => (
                                                <IconButton
                                                    key={emoji.imageURL}
                                                    onClick={() => {
                                                        onSelectEmoji(emoji)
                                                    }}
                                                >
                                                    <img
                                                        src={emoji.imageURL}
                                                        alt={emoji.shortcode}
                                                        height="30px"
                                                        width="30px"
                                                    />
                                                </IconButton>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </>
                        )}
                    </Box>
                </Popover>
            </>
        </EmojiPickerContext.Provider>
    )
}

export function useEmojiPicker(): EmojiPickerState {
    return useContext(EmojiPickerContext) as EmojiPickerState
}
