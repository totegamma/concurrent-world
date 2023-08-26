import { Card, CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@mui/material'
import { type StreamWithDomain } from '../../model'
import { AddListButton } from '../AddListButton'
import { Link } from 'react-router-dom'

import Background from '../../resources/defaultbg.png'

interface StreamCardProps {
    stream: StreamWithDomain
    isOwner?: boolean
}

export function StreamCard({ stream: value, isOwner }: StreamCardProps): JSX.Element {
    return (
        <Card>
            <CardActionArea component={Link} to={'/stream#' + value.stream.id}>
                <CardMedia component="img" height="140" image={value.stream.banner || Background} />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {value.stream.name}
                        {isOwner ? ' (owner)' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {value.stream.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {value.domain}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <AddListButton stream={value.stream.id} />
            </CardActions>
        </Card>
    )
}
