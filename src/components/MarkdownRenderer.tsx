import { type ImgHTMLAttributes, type DetailedHTMLProps, useContext } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { type ReactMarkdownProps } from 'react-markdown/lib/ast-to-react'
import breaks from 'remark-breaks'
import { Codeblock } from './Codeblock'

import type { Emoji } from '../model'
import { ApplicationContext } from '../App'

export interface MarkdownRendererProps {
    messagebody: string
}

const sanitizeOption = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'marquee'],
    attributes: {
        ...defaultSchema.attributes,
        marquee: [...(defaultSchema.attributes?.marquee ?? []), 'direction', 'behavior', 'scrollamount']
    }
}

export function MarkdownRenderer(props: MarkdownRendererProps): JSX.Element {
    const appData = useContext(ApplicationContext)

    const genEmojiTag = (emoji: Emoji): string => {
        return `<img src="${emoji.publicUrl}" alt="emoji:${emoji.name}:" title=":${emoji?.name}:"/>`
    }
    const messagebody = props.messagebody.replace(/:\w+:/gi, (name: string) => {
        const emoji: Emoji | undefined = appData.emojiDict[name.slice(1, -1)]
        if (emoji) {
            return genEmojiTag(emoji)
        }
        return `${name}`
    })

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
                    '&:first-child': {
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
                            fontSize: '0.8rem',
                            lineHeight: '1rem'
                        }
                    }
                },
                '& ol': {
                    marginTop: 1,
                    marginBottom: 1,
                    marginLeft: '1.5rem',
                    paddingLeft: 0,
                    '&:first-child': {
                        marginTop: 0
                    },
                    '&:last-child': {
                        marginBottom: 0
                    }
                }
            }}
        >
            <ReactMarkdown
                remarkPlugins={[breaks, [remarkGfm, { singleTilde: false }]]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeOption]]}
                components={{
                    p: ({ children }) => (
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: '0.9rem',
                                    sm: '1rem'
                                },
                                marginBottom: {
                                    xs: '4px',
                                    sm: '8px'
                                },
                                mt: 1,
                                mb: 1,
                                '&:first-child': {
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
                                '&:first-child': {
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
                                '&:first-child': {
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
                                '&:first-child': {
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
                        if (props.alt?.startsWith('emoji')) {
                            return (
                                <img
                                    {...props}
                                    style={{
                                        height: '1.5em',
                                        verticalAlign: '-0.5em'
                                    }}
                                />
                            )
                        }
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
                    }
                }}
            >
                {messagebody}
            </ReactMarkdown>
        </Box>
    )
}
