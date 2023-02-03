import {ReactNode} from 'react';
import { ListItem, Box, Avatar, Typography, Link } from '@mui/material';

import { RTMMessage } from '../model';
export interface TweetProps {
	message: RTMMessage;
}

function Template(props: TweetProps & {children?: ReactNode}){
    return (
        <ListItem sx={{alignItems: 'flex-start', flex: 1}}>
            {props.children}
            <Box sx={{width: '48px', mr: '12px'}}>
                <Avatar alt="Profile Picture" src={JSON.parse(props.message.payload).avatar} sx={{marginTop: '5px', width: '48px', height: '48px'}} />
            </Box>
            <Box sx={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                <Box>
                    <Typography component="span" sx={{fontWeight: '700'}}>{JSON.parse(props.message.payload).username} </Typography>
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

