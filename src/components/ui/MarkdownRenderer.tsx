import { type ImgHTMLAttributes, type DetailedHTMLProps } from 'react'
import { Box, Button, IconButton, Link, Typography } from '@mui/material'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { type ReactMarkdownProps } from 'react-markdown/lib/ast-to-react'
import breaks from 'remark-breaks'
import { Codeblock } from './Codeblock'

import type { EmojiLite } from '../../model'
import { userMentionRemarkPlugin, emojiRemarkPlugin } from '../../util'
import { CCUserChip } from './CCUserChip'
import { LinkChip } from './LinkChip'
import { ThemeCard } from '../ThemeCard'
import { closeSnackbar, useSnackbar } from 'notistack'
import { usePreference } from '../../context/PreferenceContext'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline'

export interface MarkdownRendererProps {
    messagebody: string
    emojiDict: Record<string, EmojiLite>
}

const sanitizeOption = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'marquee', 'video', 'source', 'userlink', 'emoji', 'social'],
    attributes: {
        ...defaultSchema.attributes,
        marquee: [...(defaultSchema.attributes?.marquee ?? []), 'direction', 'behavior', 'scrollamount'],
        video: [...(defaultSchema.attributes?.video ?? []), 'width', 'height', 'poster', 'loop'],
        source: [...(defaultSchema.attributes?.source ?? []), 'src', 'type'],
        userlink: ['ccid'],
        emoji: ['shortcode'],
        social: ['href', 'service', 'icon']
    }
}

export function MarkdownRenderer(props: MarkdownRendererProps): JSX.Element {
    const { enqueueSnackbar } = useSnackbar()
    const [themeName, setThemeName] = usePreference('themeName')
    const [customThemes, setCustomThemes] = usePreference('customThemes')

    return (
        <Box
            sx={{
                width: '100%',
                '& ul': {
                    marginTop: 1,
                    marginBottom: 1,
                    listStyle: 'none',
                    marginLeft: '0.8rem',
                    paddingLeft: 0,
                    fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                    },
                    '&:firs-child': {
                        marginTop: 0
                    },
                    '&:last-child': {
                        marginBottom: 0
                    },
                    '& li': {
                        '&::before': {
                            content: '"•"',
                            display: 'inline-block',
                            width: '1em',
                            marginLeft: '-1em',
                            textAlign: 'center',
                            fontSize: {
                                xs: '0.7rem',
                                sm: '0.8rem'
                            },
                            lineHeight: {
                                xs: '0.9rem',
                                sm: '1rem'
                            }
                        }
                    }
                },
                '& ol': {
                    marginTop: 1,
                    marginBottom: 1,
                    marginLeft: {
                        xs: '1.3rem',
                        sm: '1.4rem'
                    },
                    paddingLeft: 0,
                    fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                    },
                    '&:first-of-type': {
                        marginTop: 0
                    },
                    '&:last-child': {
                        marginBottom: 0
                    }
                }
            }}
        >
            <ReactMarkdown
                remarkPlugins={[
                    breaks,
                    [remarkGfm, { singleTilde: false }],
                    userMentionRemarkPlugin,
                    emojiRemarkPlugin
                ]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeOption]]}
                remarkRehypeOptions={{
                    handlers: {
                        userlink: (h, node) => {
                            return h(node, 'userlink', { ccid: node.ccid })
                        },
                        emoji: (h, node) => {
                            return h(node, 'emoji', { shortcode: node.shortcode })
                        }
                    }
                }}
                components={{
                    userlink: ({ ccid }) => {
                        return <CCUserChip ccid={ccid} />
                    },
                    social: ({ href, icon, service, children }) => {
                        return (
                            <LinkChip href={href} icon={icon} service={service}>
                                {children}
                            </LinkChip>
                        )
                    },
                    p: ({ children }) => (
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: '0.9rem',
                                    sm: '1rem'
                                },
                                mt: 1,
                                mb: 1,
                                '&:first-of-type': {
                                    mt: 0
                                },
                                '&:last-child': {
                                    mb: 0
                                }
                            }}
                            paragraph
                        >
                            {children}
                        </Typography>
                    ),
                    h1: ({ children }) => (
                        <Typography
                            sx={{
                                mt: 1.8,
                                mb: 1,
                                '&:first-of-type': {
                                    mt: 0
                                }
                            }}
                            variant="h1"
                        >
                            {children}
                        </Typography>
                    ),
                    h2: ({ children }) => (
                        <Typography
                            sx={{
                                mt: 1.5,
                                mb: 1,
                                '&:first-of-type': {
                                    mt: 0
                                },
                                '&:last-child': {
                                    mb: 0
                                }
                            }}
                            variant="h2"
                        >
                            {children}
                        </Typography>
                    ),
                    h3: ({ children }) => (
                        <Typography
                            sx={{
                                mt: 1,
                                mb: 1,
                                '&:first-of-type': {
                                    mt: 0
                                },
                                '&:last-child': {
                                    mb: 0
                                }
                            }}
                            variant="h3"
                        >
                            {children}
                        </Typography>
                    ),
                    h4: ({ children }) => <Typography variant="h4">{children}</Typography>,
                    h5: ({ children }) => <Typography variant="h5">{children}</Typography>,
                    h6: ({ children }) => <Typography variant="h6">{children}</Typography>,
                    ul: ({ children }) => <ul style={{}}>{children}</ul>,
                    ol: ({ children }) => <ol style={{}}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginLeft: 0 }}>{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                            {children}
                        </blockquote>
                    ),
                    a: ({ children, href }) => {
                        if (href?.endsWith('.wav') || href?.endsWith('.mp3')) {
                            return (
                                <audio controls src={href}>
                                    <Link href={href} target="_blank">
                                        {children}
                                    </Link>
                                </audio>
                            )
                        } else {
                            return (
                                <Link href={href} target="_blank" color="secondary" underline="hover">
                                    {children}
                                </Link>
                            )
                        }
                    },
                    code: ({ node, children, inline }) => {
                        const language = node.position
                            ? props.messagebody
                                  .slice(node.position.start.offset, node.position.end.offset)
                                  .split('\n')[0]
                                  .slice(3)
                            : ''

                        if (language === 'theme') {
                            try {
                                const theme = JSON.parse(String(children))
                                return (
                                    <ThemeCard
                                        theme={theme}
                                        additionalButton={
                                            <IconButton
                                                onClick={() => {
                                                    if (!theme.meta?.name) return
                                                    enqueueSnackbar(`Theme downloaded: ${theme.meta.name}`, {
                                                        autoHideDuration: 15000,
                                                        action: (key) => (
                                                            <Button
                                                                onClick={() => {
                                                                    setThemeName(themeName)
                                                                    closeSnackbar(key)
                                                                }}
                                                            >
                                                                Undo
                                                            </Button>
                                                        )
                                                    })
                                                    setThemeName(theme.meta.name)
                                                    setCustomThemes({
                                                        ...customThemes,
                                                        [theme.meta.name]: theme
                                                    })
                                                }}
                                                sx={{
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                <DownloadForOfflineIcon />
                                            </IconButton>
                                        }
                                    />
                                )
                            } catch (e) {
                                console.error(e)
                            }
                        }

                        return inline ? (
                            <Box
                                component="span"
                                sx={{
                                    fontFamily: 'Source Code Pro, monospace',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 1,
                                    border: '0.5px solid #ddd',
                                    padding: '0 0.5rem',
                                    margin: '0 0.2rem'
                                }}
                            >
                                {children}
                            </Box>
                        ) : (
                            <Codeblock language={language}>{String(children).replace(/\n$/, '')}</Codeblock>
                        )
                    },
                    img: (
                        props: Pick<
                            DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
                            'key' | keyof ImgHTMLAttributes<HTMLImageElement>
                        > &
                            ReactMarkdownProps
                    ) => {
                        return (
                            <a href={props.src} target="_blank" rel="noreferrer">
                                <Box
                                    {...props}
                                    component="img"
                                    maxWidth="100%"
                                    borderRadius={1}
                                    sx={{
                                        maxHeight: '20vh'
                                    }}
                                />
                            </a>
                        )
                    },
                    emoji: ({ shortcode }) => {
                        const emoji = props.emojiDict[shortcode]
                        return emoji ? (
                            <img
                                src={emoji?.animURL ?? emoji?.imageURL ?? ''}
                                style={{
                                    height: '1.25em',
                                    verticalAlign: '-0.45em',
                                    marginBottom: '4px'
                                }}
                            />
                        ) : (
                            <span>:{shortcode}:</span>
                        )
                    },
                    video: (props) => {
                        return (
                            <Box
                                {...props}
                                component="video"
                                maxWidth="100%"
                                borderRadius={1}
                                sx={{
                                    maxHeight: '20vh'
                                }}
                                controls
                                preload="metadata"
                            />
                        )
                    }
                }}
            >
                {props.messagebody}
            </ReactMarkdown>
        </Box>
    )
}
