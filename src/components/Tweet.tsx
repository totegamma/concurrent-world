import { useState, useEffect, useContext } from 'react';
import { ListItem, Box, Avatar, Typography, Link, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Sign } from '../util'

import { ApplicationContext } from '../App';
import { RTMMessage, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
export interface TweetProps {
    message: string;
    messageDict: IuseResourceManager<RTMMessage>;
    userDict: IuseResourceManager<User>;
    inspect: (message: RTMMessage | null) => void;
}

export function Tweet(props: TweetProps) {
    let [user, setUser] = useState<User | null>();
    let [message, setMessage] = useState<RTMMessage | undefined>();

    const appData = useContext(ApplicationContext)

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
        const favoliteScheme = "https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/associations/like/v1.json"
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
        <ListItem sx={{alignItems: 'flex-start', flex: 1}}>
            { message && <>
            <Box sx={{width: '48px', mr: '12px'}}>
                <IconButton>
                    <Avatar alt="Profile Picture" src={user?.avatar} sx={{marginTop: '5px', width: '48px', height: '48px'}} />
                </IconButton>
            </Box>
            <Box sx={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                <Box>
                    <Typography component="span" sx={{fontWeight: '700'}}>{user?.username} </Typography>
                    <Typography component="span" sx={{fontWeight: '400'}}>
                        <Link component="button" underline="hover" color="inherit">
                            {message.cdate}
                        </Link>
                    </Typography>
                </Box>
                <Box>
                    {JSON.parse(message.payload).body}
                </Box>
                <Box>
                    {message.associations_data.find((e) => e.author == appData.userAddress) ?
                    <IconButton color="primary" onClick={() => unfavorite(message?.id, message?.associations_data.find((e) => e.author == appData.userAddress)?.id)} >
                        <StarIcon/> {message.associations_data.filter(e => e.schema == "https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/associations/like/v1.json").length}
                    </IconButton>
                    :
                    <IconButton onClick={() => favorite(message?.id)} >
                        <StarIcon/> {message.associations_data.filter(e => e.schema == "https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/associations/like/v1.json").length}
                    </IconButton>
                    }
                    <IconButton onClick={() => props.inspect(message ?? null)} >
                        <MoreHorizIcon/>
                    </IconButton>
                </Box>
            </Box>
            </>
            }
        </ListItem>
    )

}

