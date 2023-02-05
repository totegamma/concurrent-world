import { ReactNode, useState, useEffect } from 'react';
import { ListItem, Box, Avatar, Typography, Link, IconButton } from '@mui/material';

import { RTMMessage, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
export interface TweetProps {
    message: RTMMessage;
    userDict: IuseResourceManager<User>;
    clickAvatar: () => void;
}

function Template(props: TweetProps & {children?: ReactNode}){
    let [user, setUser] = useState<User | null>();

    useEffect(() => {
        const f = async () => {
            let req_user = await props.userDict.get(props.message.author);
            setUser(req_user);
        };
        f();
    }, [props.message]);

    return (
        <ListItem sx={{alignItems: 'flex-start', flex: 1}}>
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
                            {props.message.cdate}
                        </Link>
                    </Typography>
                </Box>
                <Box>
                    {JSON.parse(props.message.payload).body}
                </Box>
                <Box sx={{color: "#ddd", wordBreak: "break-all"}}>
                    {props.message.signature}
                </Box>
            </Box>
        </ListItem>
    )
}

export function Tweet(props: TweetProps) {
    return (<>
        <Template {...props} />
    </>)
}

