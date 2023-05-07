import {
    useState,
    useEffect,
    useContext,
    type ImgHTMLAttributes,
    type DetailedHTMLProps
} from 'react'
import {
    ListItem,
    Box,
    Avatar,
    Typography,
    Link,
    IconButton,
    Drawer,
    ThemeProvider,
    useTheme
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Sign } from '../util'

import { ApplicationContext } from '../App'
import { type Emoji, type RTMMessage, type User } from '../model'
import { type IuseResourceManager } from '../hooks/useResourceManager'
import { Schemas } from '../schemas'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { type ReactMarkdownProps } from 'react-markdown/lib/ast-to-react'
import { Themes } from '../themes'

export interface TweetProps {
    message: string
    messageDict: IuseResourceManager<RTMMessage>
    userDict: IuseResourceManager<User>
    follow: (ccaddress: string) => void
}

export function Tweet(props: TweetProps): JSX.Element {
    const [user, setUser] = useState<User | null>()
    const [message, setMessage] = useState<RTMMessage | undefined>()
    const [msgstreams, setStreams] = useState<string>('')

    const appData = useContext(ApplicationContext)

    const theme = useTheme()

    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)

    const loadTweet = (): void => {
        props.messageDict
            .get(props.message)
            .then((msg) => {
                setMessage(msg)
                props.userDict
                    .get(msg.author)
                    .then((user) => {
                        setUser(user)
                    })
                    .catch((error) => {
                        console.error(error)
                    })

                Promise.all(
                    msg.streams
                        .split(',')
                        .map(
                            async (id) =>
                                await appData.streamDict
                                    ?.get(id)
                                    .then((e) =>
                                        e.meta ? JSON.parse(e.meta).name : null
                                    )
                        )
                ).then((e) => {
                    setStreams(e.filter((x) => x).join(','))
                })
            })
            .catch((error) => {
                console.error(error)
            })
    }

    useEffect(() => {
        loadTweet()
    }, [props.message])

    const favorite = async (messageID: string | undefined): Promise<void> => {
        const favoriteScheme = Schemas.like
        if (!messageID) return
        const payloadObj = {}
        const payload = JSON.stringify(payloadObj)
        const signature = Sign(appData.privatekey, payload)
        const targetAuthor = (await props.messageDict.get(messageID)).author
        console.log(targetAuthor)
        const targetStream = (await props.userDict.get(targetAuthor))
            .notificationstream
        console.log([targetStream].filter((e) => e))

        const requestOptions = {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                author: appData.userAddress,
                schema: favoriteScheme,
                target: messageID,
                payload,
                signature,
                streams: [targetStream].filter((e) => e)
            })
        }

        fetch(appData.serverAddress + 'associations', requestOptions)
            .then(async (res) => await res.json())
            .then((_) => {
                props.messageDict.invalidate(messageID)
                loadTweet()
            })
    }

    const unfavorite = (
        messageID: string | undefined,
        deletekey: string | undefined
    ): void => {
        if (!messageID) return
        if (!unfavorite) return
        const requestOptions = {
            method: 'DELETE',
            headers: {},
            body: JSON.stringify({
                id: deletekey
            })
        }

        fetch(appData.serverAddress + 'associations', requestOptions)
            .then(async (res) => await res.json())
            .then((_) => {
                props.messageDict.invalidate(messageID)
                loadTweet()
            })
    }
    return (
        <ListItem
            sx={{ alignItems: 'flex-start', flex: 1, gap: '25px', p: '10px 0' }}
        >
            {message != null && (
                <>
                    <Box sx={{ width: '48px' }}>
                        <IconButton
                            onClick={() => {
                                props.follow(message.author)
                            }}
                        >
                            <Avatar
                                alt="Profile Picture"
                                src={user?.avatar}
                                sx={{ width: '48px', height: '48px' }}
                            />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            mt: '5px'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box>
                                <Typography
                                    component="span"
                                    sx={{ fontWeight: '700' }}
                                >
                                    {user?.username}{' '}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{ fontweight: '400', fontSize: '10px' }}
                                >
                                    {message.author} ·{' '}
                                </Typography>
                                <Link
                                    component="button"
                                    underline="hover"
                                    color="inherit"
                                >
                                    {new Date(message.cdate).toLocaleString()}
                                </Link>
                            </Box>
                            <Typography
                                component="span"
                                sx={{ fontWeight: '400' }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        fontweight: '400',
                                        fontSize: '13px',
                                        color: '#aaa'
                                    }}
                                >
                                    %{msgstreams.replaceAll(',', ' %')}{' '}
                                </Typography>
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <pre
                                style={{
                                    margin: 0,
                                    fontFamily: 'inherit',
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-wrap',
                                    overflow: 'hidden'
                                }}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[
                                        [remarkGfm, { singleTilde: false }]
                                    ]}
                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                    components={{
                                        p: ({ children }) => (
                                            <Typography paragraph>
                                                {children}
                                            </Typography>
                                        ),
                                        h1: ({ children }) => (
                                            <Typography variant="h1">
                                                {children}
                                            </Typography>
                                        ),
                                        h2: ({ children }) => (
                                            <Typography variant="h2">
                                                {children}
                                            </Typography>
                                        ),
                                        h3: ({ children }) => (
                                            <Typography variant="h3">
                                                {children}
                                            </Typography>
                                        ),
                                        h4: ({ children }) => (
                                            <Typography variant="h4">
                                                {children}
                                            </Typography>
                                        ),
                                        h5: ({ children }) => (
                                            <Typography variant="h5">
                                                {children}
                                            </Typography>
                                        ),
                                        h6: ({ children }) => (
                                            <Typography variant="h6">
                                                {children}
                                            </Typography>
                                        ),
                                        ul: ({ children }) => (
                                            <ul>{children}</ul>
                                        ),
                                        img: (
                                            props: Pick<
                                                DetailedHTMLProps<
                                                    ImgHTMLAttributes<HTMLImageElement>,
                                                    HTMLImageElement
                                                >,
                                                | 'key'
                                                | keyof ImgHTMLAttributes<HTMLImageElement>
                                            > &
                                                ReactMarkdownProps
                                        ) => {
                                            if (
                                                props.alt?.startsWith('emoji')
                                            ) {
                                                return (
                                                    <img
                                                        {...props}
                                                        style={{
                                                            height: '1.5em',
                                                            verticalAlign:
                                                                '-0.5em'
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
                                    {JSON.parse(message.payload).body?.replace(
                                        /:\w+:/gi,
                                        (name: string) => {
                                            const emoji: Emoji | undefined =
                                                appData.emojiDict[
                                                    name.slice(1, -1)
                                                ]
                                            if (emoji) {
                                                return `<img 
                                                    title=":${emoji?.name}:"
                                                    alt="emoji:${emoji?.name}:"
                                                    src="${emoji?.publicUrl}"
                                                    />`
                                            }
                                            return `${name}`
                                        }
                                    )}
                                </ReactMarkdown>
                            </pre>
                        </Box>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            {message.associations_data.find(
                                (e) => e.author === appData.userAddress
                            ) != null ? (
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: theme.palette.text.secondary
                                    }}
                                    color="primary"
                                    onClick={() => {
                                        unfavorite(
                                            message?.id,
                                            message?.associations_data.find(
                                                (e) =>
                                                    e.author ===
                                                    appData.userAddress
                                            )?.id
                                        )
                                    }}
                                >
                                    <StarIcon />{' '}
                                    <Typography sx={{ size: '16px' }}>
                                        {
                                            message.associations_data.filter(
                                                (e) => e.schema === Schemas.like
                                            ).length
                                        }
                                    </Typography>
                                </IconButton>
                            ) : (
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: theme.palette.text.secondary
                                    }}
                                    onClick={() => {
                                        favorite(message?.id)
                                    }}
                                >
                                    <StarOutlineIcon />{' '}
                                    <Typography sx={{ size: '16px' }}>
                                        {
                                            message.associations_data.filter(
                                                (e) => e.schema === Schemas.like
                                            ).length
                                        }
                                    </Typography>
                                </IconButton>
                            )}
                            <IconButton
                                onClick={() => {
                                    setInspectItem(message ?? null)
                                }}
                                sx={{
                                    p: '0',
                                    color: theme.palette.text.secondary
                                }}
                            >
                                <MoreHorizIcon />
                            </IconButton>
                        </Box>
                        <Drawer
                            anchor={'right'}
                            open={inspectItem != null}
                            onClose={() => {
                                setInspectItem(null)
                            }}
                            PaperProps={{
                                sx: {
                                    width: '40vw',
                                    borderRadius: '20px 0 0 20px',
                                    overflow: 'hidden',
                                    padding: '20px'
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    margin: 0,
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '13px'
                                }}
                            >
                                <Typography>ID: {inspectItem?.id}</Typography>
                                <Typography>
                                    Author: {inspectItem?.author}
                                </Typography>
                                <Typography>
                                    Schema: {inspectItem?.schema}
                                </Typography>
                                <Typography>
                                    Signature: {inspectItem?.signature}
                                </Typography>
                                <Typography>
                                    Created: {inspectItem?.cdate}
                                </Typography>
                                <Typography>Payload:</Typography>
                                <pre style={{ overflowX: 'scroll' }}>
                                    {JSON.stringify(
                                        JSON.parse(
                                            inspectItem?.payload ?? 'null'
                                        ),
                                        null,
                                        4
                                    ).replaceAll('\\n', '\n')}
                                </pre>
                                <Typography>
                                    Associations: {inspectItem?.associations}
                                </Typography>
                                <Typography>AssociationsData:</Typography>
                                <pre style={{ overflowX: 'scroll' }}>
                                    {JSON.stringify(
                                        inspectItem?.associations_data,
                                        null,
                                        4
                                    )}
                                </pre>
                            </Box>
                        </Drawer>
                    </Box>
                </>
            )}
        </ListItem>
    )
}
