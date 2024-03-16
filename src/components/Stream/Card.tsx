import { Card, CardActionArea, CardActions, CardContent, type SxProps, Typography } from '@mui/material'
import { AddListButton } from '../AddListButton'
import { Link } from 'react-router-dom'

import { CCWallpaper } from '../ui/CCWallpaper'

interface StreamCardProps {
    streamID: string
    name: string
    description: string
    banner: string
    domain: string
    isOwner?: boolean
    sx?: SxProps
}

export function StreamCard(props: StreamCardProps): JSX.Element {
    return (
        <Card
            sx={{
                maxWidth: 345,
                ...props.sx
            }}
        >
            <CardActionArea component={Link} to={'/stream/' + props.streamID}>
                <CCWallpaper
                    sx={{
                        height: '140px'
                    }}
                    override={props.banner}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.name}
                        {props.isOwner ? ' (owner)' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {props.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {props.domain}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <AddListButton stream={props.streamID} />
            </CardActions>
        </Card>
    )
}
