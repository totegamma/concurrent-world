import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
    Popover,
    TextField,
    Box,
    Tabs,
    Tab,
    Typography,
    Divider,
    IconButton,
    alpha,
    useTheme,
    Button
} from '@mui/material'
import { usePreference } from './PreferenceContext'
import { type EmojiPackage, type Emoji } from '../model'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import SearchIcon from '@mui/icons-material/Search'
import { usePersistent } from '../hooks/usePersistent'
import { Link as RouterLink } from 'react-router-dom'

import Fuzzysort from 'fuzzysort'
import { experimental_VGrid as VGrid, type VGridHandle } from 'virtua'

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
    const [emojiPackageSource] = usePreference('emojiPackages')
    const theme = useTheme()

    const RowEmojiCount = 6

    const [anchor, setAnchor] = useState<HTMLElement | null>(null)
    const onSelectedRef = useRef<((selected: Emoji) => void) | null>(null)
    const [frequentEmojis, setFrequentEmojis] = usePersistent<Emoji[]>('FrequentEmojis', [])
    const [query, setQuery] = useState<string>('')
    const [emojiPackages, setEmojiPackages] = useState<EmojiPackage[]>([])
    const [allemojis, setAllEmojis] = useState<Emoji[]>([])
    const [emojiPickerTab, setEmojiPickerTab] = useState<number>(0)
    const [searchResults, setSearchResults] = useState<Emoji[]>([])
    const [selected, setSelected] = useState<number>(0)
    const [searchBoxFocused, setSearchBoxFocused] = useState<boolean>(false)

    const gridRef = useRef<VGridHandle>(null)

    const title: string = useMemo(() => {
        if (query.length > 0) {
            return 'Search Result'
        } else {
            if (emojiPickerTab === 0) {
                return 'Frequently Used'
            } else {
                return emojiPackages[emojiPickerTab - 1]?.name ?? '設定から絵文字パッケージを追加しましょう'
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
                return emojiPackages[emojiPickerTab - 1]?.emojis ?? []
            }
        }
    }, [emojiPickerTab, emojiPackages, frequentEmojis, query, searchResults])

    const open = useCallback((anchor: HTMLElement, onSelected: (selected: Emoji) => void) => {
        setAnchor(anchor)
        setEmojiPickerTab(frequentEmojis.length > 0 ? 0 : 1)
        onSelectedRef.current = onSelected
    }, [])

    const close = useCallback(() => {
        setAnchor(null)
        setQuery('')
        onSelectedRef.current = null
    }, [])

    const search = useCallback(
        (input: string, limit: number = 10) => {
            const results = Fuzzysort.go(input, allemojis, {
                limit,
                threshold: -10000,
                keys: ['shortcode', 'keywords']
            }).map((result) => result.obj)

            return results.filter(
                (elem, index) => results.findIndex((e: Emoji) => e.imageURL === elem.imageURL) === index
            )
        },
        [allemojis]
    )

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
        Promise.all(
            emojiPackageSource.map(async (url) => {
                const rawpackage = await fetch(url).then((j) => j.json())
                const packages: EmojiPackage = {
                    ...rawpackage,
                    packageURL: url
                }
                return packages
            })
        ).then((packages: EmojiPackage[]) => {
            setEmojiPackages(packages)
            setAllEmojis(packages.flatMap((p) => p.emojis))
        })
    }, [emojiPackageSource])

    useEffect(() => {
        if (query.length > 0) {
            setSearchResults(search(query, 100))
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
                            width: '320px',
                            height: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <Box // header
                        display="flex"
                        flexDirection="column"
                    >
                        <Tabs
                            value={query.length === 0 ? emojiPickerTab : 0}
                            onChange={(_, newValue) => {
                                setQuery('')
                                setEmojiPickerTab(newValue)
                            }}
                            variant="scrollable"
                            scrollButtons="auto"
                            textColor="secondary"
                            indicatorColor="secondary"
                        >
                            {query.length === 0 ? (
                                <Tab
                                    key="frequent"
                                    aria-label="Frequently Used"
                                    icon={<AccessTimeFilledIcon />}
                                    sx={tabsx}
                                    onClick={() => {
                                        gridRef.current?.scrollTo(0, 0)
                                    }}
                                />
                            ) : (
                                <Tab key="search" aria-label="Search Result" icon={<SearchIcon />} sx={tabsx} />
                            )}
                            {emojiPackages.map((emojiPackage, _index) => (
                                <Tab
                                    key={emojiPackage.packageURL}
                                    aria-label={emojiPackage.name}
                                    icon={<img src={emojiPackage.iconURL} alt={emojiPackage.name} height="20px" />}
                                    sx={tabsx}
                                    onClick={() => {
                                        gridRef.current?.scrollTo(0, 0)
                                    }}
                                />
                            ))}
                        </Tabs>
                        <Divider />
                        <TextField
                            autoFocus
                            placeholder="Search emoji"
                            value={query}
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
                                        onSelectEmoji(displayEmojis[selected])
                                    }
                                }
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    const next = Math.min(selected + RowEmojiCount, displayEmojis.length - 1)
                                    setSelected(next)
                                }
                                if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    const next = Math.max(selected - RowEmojiCount, 0)
                                    setSelected(next)
                                }
                                if (e.key === 'ArrowLeft') {
                                    e.preventDefault()
                                    const next = Math.max(selected - 1, 0)
                                    setSelected(next)
                                }
                                if (e.key === 'ArrowRight') {
                                    e.preventDefault()
                                    const next = Math.min(selected + 1, displayEmojis.length - 1)
                                    setSelected(next)
                                }
                            }}
                            onFocus={() => {
                                setSelected(0)
                                setSearchBoxFocused(true)
                            }}
                            onBlur={() => {
                                setSearchBoxFocused(false)
                            }}
                        />
                    </Box>
                    <Box // body
                        flexGrow={1}
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                        padding={1}
                    >
                        <Box // Header
                            display="flex"
                        >
                            <Typography>{title}</Typography>
                        </Box>
                        <VGrid
                            row={Math.max(Math.ceil(displayEmojis.length / RowEmojiCount), 4)} // HACK: 画面の高さを割るとvirtuaが壊れる
                            col={RowEmojiCount}
                            style={{
                                overflowX: 'hidden',
                                overflowY: 'auto',
                                width: '310px',
                                height: '190px'
                            }}
                            cellHeight={50}
                            cellWidth={50}
                            ref={gridRef}
                        >
                            {({ colIndex, rowIndex }) => {
                                const index = rowIndex * RowEmojiCount + colIndex
                                const emoji = displayEmojis[rowIndex * RowEmojiCount + colIndex]
                                if (!emoji) {
                                    return null
                                }
                                return (
                                    <IconButton
                                        onMouseDown={() => {
                                            onSelectEmoji(emoji)
                                        }}
                                        onMouseOver={() => {
                                            setSelected(index)
                                        }}
                                        sx={{
                                            bgcolor:
                                                selected === index && searchBoxFocused
                                                    ? alpha(theme.palette.primary.main, 0.3)
                                                    : 'transparent',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.5)
                                            }
                                        }}
                                    >
                                        <img src={emoji.imageURL} alt={emoji.shortcode} height="30px" width="30px" />
                                    </IconButton>
                                )
                            }}
                        </VGrid>
                    </Box>
                    <Divider />
                    <Box display="flex" padding={1} justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box /* preview */
                                component="img"
                                src={displayEmojis[selected]?.imageURL}
                                alt={displayEmojis[selected]?.shortcode}
                                height="30px"
                                width="30px"
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'inline-block',
                                    width: '100px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {displayEmojis[selected]?.shortcode}
                            </Typography>
                        </Box>
                        <Button
                            component={RouterLink}
                            variant="outlined"
                            to="/settings/emoji"
                            onClick={() => {
                                setAnchor(null)
                            }}
                        >
                            絵文字を追加
                        </Button>
                    </Box>
                </Popover>
            </>
        </EmojiPickerContext.Provider>
    )
}

export function useEmojiPicker(): EmojiPickerState {
    return useContext(EmojiPickerContext) as EmojiPickerState
}
