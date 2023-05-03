import { useState, useEffect, useContext } from 'react';
import { ListItem, Box, Avatar, Typography, Link, IconButton, Drawer } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Sign } from '../util'

import { ApplicationContext } from '../App';
import { RTMMessage, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
import { Schemas } from '../schemas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'

export interface TweetProps {
    message: string;
    messageDict: IuseResourceManager<RTMMessage>;
    userDict: IuseResourceManager<User>;
}

export function Tweet(props: TweetProps) {
    let [user, setUser] = useState<User | null>();
    let [message, setMessage] = useState<RTMMessage | undefined>();

    const appData = useContext(ApplicationContext)

    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)

    const loadTweet = () => {
        props.messageDict.get(props.message).then((msg) => {
            setMessage(msg)
            props.userDict.get(msg.author).then((user) => {
                setUser(user)
            }).catch((error) => {
                console.error(error);
            })
        }).catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => {
        loadTweet()
    }, [props.message]);

    const favorite = (messageID: string | undefined) => {
        const favoliteScheme = Schemas.like
        if (!messageID) return;
        const payload_obj = {
        }
        const payload = JSON.stringify(payload_obj)
        const signature = Sign(appData.privatekey, payload)

        const requestOptions =  {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                author: appData.userAddress,
                schema: favoliteScheme,
                target: messageID,
                payload: payload,
                signature: signature,
            })
        }

        fetch(appData.serverAddress + 'associations', requestOptions)
        .then(res => res.json())
        .then(_ => {
            props.messageDict.invalidate(messageID);
            loadTweet()
        });
    }

    const unfavorite = (messageID: string | undefined, deletekey: string | undefined) => {
        if (!messageID) return;
        if (!unfavorite) return;
        const requestOptions = {
            method: 'DELETE',
            headers: {},
            body: JSON.stringify({
                id: deletekey
            })
        };

        fetch(appData.serverAddress + 'associations', requestOptions)
        .then(res => res.json())
        .then(_ => {
            props.messageDict.invalidate(messageID);
            loadTweet()
        });
    }

    return (
        <ListItem sx={{alignItems: 'flex-start', flex: 1, gap: '25px', p: '10px 0'}}>
            { message && <>
            <Box sx={{width: '48px'}}>
                <IconButton>
                    <Avatar alt="Profile Picture" src={user?.avatar} sx={{width: '48px', height: '48px'}} />
                </IconButton>
            </Box>
            <Box sx={{display: 'flex', flex: 1, flexDirection: 'column', mt: '5px'}}>
                <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
                    <Box>
                        <Typography component="span" sx={{fontWeight: '700'}}>{user?.username} </Typography>
                        <Typography component="span" sx={{fontweight: '400', fontSize: '10px'}}>{message.author} · </Typography>
                        <Link component="button" underline="hover" color="inherit">
                            {new Date(message.cdate).toLocaleString()}
                        </Link>
                    </Box>
                    <Typography component="span" sx={{fontWeight: '400'}}>
                        <Typography component="span" sx={{fontweight: '400', fontSize: '13px', color: '#aaa'}}>%{message.streams.replaceAll(',', ' %')} </Typography>
                    </Typography>
                </Box>
                <Box sx={{width: '100%'}}>
                    <pre style={{margin: 0, fontFamily: 'inherit', wordBreak: 'break-all', whiteSpace: 'pre-wrap', overflow: 'hidden'}}>
                        <ReactMarkdown
                            remarkPlugins={[[remarkGfm, {singleTilde: false}]]}
                            components={{
                                p: ({ children }) => <Typography paragraph>{children}</Typography>,
                                img: props => <img {...props} style={{ maxWidth: "100%" }} />
                            }}
                        >
                            {JSON.parse(message.payload).body}
                        </ReactMarkdown>
                    </pre>
                </Box>
                <Box sx={{display: 'flex', gap: '10px'}}>
                    {message.associations_data.find((e) => e.author == appData.userAddress) ?
                    <IconButton sx={{p: '0'}} color="primary" onClick={() => unfavorite(message?.id, message?.associations_data.find((e) => e.author == appData.userAddress)?.id)} >
                        <StarIcon /> <Typography sx={{size: '16px'}}>{message.associations_data.filter(e => e.schema == Schemas.like).length}</Typography>
                    </IconButton>
                    :
                    <IconButton sx={{p: '0'}}onClick={() => favorite(message?.id)} >
                        <StarIcon/> <Typography sx={{size: '16px'}}>{message.associations_data.filter(e => e.schema == Schemas.like).length}</Typography>
                    </IconButton>
                    }
                    <IconButton onClick={() => setInspectItem(message ?? null)} >
                        <MoreHorizIcon/>
                    </IconButton>
                </Box>
                <Drawer
                    anchor={'right'}
                    open={inspectItem != null}
                    onClose={() => setInspectItem(null)}
                    PaperProps={{
                        sx: {
                            width: "40vw",
                            borderRadius: "20px 0 0 20px",
                            overflow: "hidden",
                            padding: "20px",
                        }
                    }}
                >
                    <Box sx={{margin: 0, wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: "13px"}}>
                        <Typography>ID: {inspectItem?.id}</Typography>
                        <Typography>Author: {inspectItem?.author}</Typography>
                        <Typography>Schema: {inspectItem?.schema}</Typography>
                        <Typography>Signature: {inspectItem?.signature}</Typography>
                        <Typography>Created: {inspectItem?.cdate}</Typography>
                        <Typography>Payload:</Typography>
                        <pre style={{ overflowX: "scroll" }}>
                            {JSON.stringify(JSON.parse(inspectItem?.payload ?? "null"), null, 4).replaceAll('\\n', '\n')}
                        </pre>
                        <Typography>Associations: {inspectItem?.associations}</Typography>
                        <Typography>AssociationsData:</Typography>
                        <pre style={{ overflowX: "scroll" }}>
                            {JSON.stringify(inspectItem?.associations_data, null, 4)}
                        </pre>

                    </Box>
              </Drawer>
            </Box>
            </>
            }
        </ListItem>
    )
}

