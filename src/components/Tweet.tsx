import { ReactNode, useState, useEffect } from 'react';
import { ListItem, Box, Avatar, Typography, Link, IconButton } from '@mui/material';

import { RTMMessage, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
export interface TweetProps {
    message: Promise<RTMMessage>;
    userDict: IuseResourceManager<User>;
    clickAvatar: () => void;
}

function Template(props: TweetProps & {children?: ReactNode}){
    let [user, setUser] = useState<User | null>();
    let [message, setMessage] = useState<RTMMessage | undefined>();

    useEffect(() => {
        props.message.then((msg) => {
            setMessage(msg)
            props.userDict.get(msg.author).then((user) => {
                setUser(user)
            }).catch((error) => {
                console.error(error);
            })
        }).catch((error) => {
            console.error(error);
        });
    }, [props.message]);

    return (
        <ListItem sx={{alignItems: 'flex-start', flex: 1}}>
            { message && <>
            {props.children}
            <Box sx={{width: '48px', mr: '12px'}}>
                <IconButton
                    onClick={() => props.clickAvatar()}
                >
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
            </Box>
            </>
            }
        </ListItem>
    )
}

export function Tweet(props: TweetProps) {
    return (<>
        <Template {...props} />
    </>)
}

