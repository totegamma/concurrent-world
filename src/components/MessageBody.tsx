import { type ImgHTMLAttributes, type DetailedHTMLProps } from 'react'
import { Box, Typography } from '@mui/material'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { type ReactMarkdownProps } from 'react-markdown/lib/ast-to-react'
import breaks from 'remark-breaks'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface MessageBodyProps {
    messagebody: string
}

export function MessageBody(props: MessageBodyProps): JSX.Element {
    return (
        <Box sx={{ width: '100%' }}>
            <ReactMarkdown
                remarkPlugins={[breaks, [remarkGfm, { singleTilde: false }]]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    p: ({ children }) => (
                        <Typography
                            sx={{
                                marginBottom: {
                                    xs: '4px',
                                    sm: '8px'
                                }
                            }}
                            paragraph
                        >
                            {children}
                        </Typography>
                    ),
                    h1: ({ children }) => (
                        <Typography variant="h1">{children}</Typography>
                    ),
                    h2: ({ children }) => (
                        <Typography variant="h2">{children}</Typography>
                    ),
                    h3: ({ children }) => (
                        <Typography variant="h3">{children}</Typography>
                    ),
                    h4: ({ children }) => (
                        <Typography variant="h4">{children}</Typography>
                    ),
                    h5: ({ children }) => (
                        <Typography variant="h5">{children}</Typography>
                    ),
                    h6: ({ children }) => (
                        <Typography variant="h6">{children}</Typography>
                    ),
                    ul: ({ children }) => <ul>{children}</ul>,
                    code: ({ node, children }) => {
                        const language = node.position
                            ? props.messagebody
                                  .slice(
                                      node.position.start.offset,
                                      node.position.end.offset
                                  )
                                  .split('\n')[0]
                                  .slice(3)
                            : ''
                        return (
                            <Box
                                sx={{
                                    overflow: 'hidden',
                                    borderRadius: '10px'
                                }}
                            >
                                <SyntaxHighlighter
                                    style={materialDark}
                                    language={language}
                                    PreTag="div"
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </Box>
                        )
                    },
                    img: (
                        props: Pick<
                            DetailedHTMLProps<
                                ImgHTMLAttributes<HTMLImageElement>,
                                HTMLImageElement
                            >,
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
                            <img
                                {...props}
                                style={{
                                    maxWidth: '100%'
                                }}
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
