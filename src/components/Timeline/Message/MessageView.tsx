import { Box, IconButton, ListItem, Typography, Grid, Chip, styled } from '@mui/material'
import Tooltip, { type TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import { SimpleNote } from '../SimpleNote'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import type { Profile } from '../../../schemas/profile'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import { useSnackbar } from 'notistack'
import { FollowButton } from '../../FollowButton'

export interface MessageViewProps {
    message: CCMessage<TypeSimpleNote | ReplyMessage>
    userCCID: string
    author: Character<Profile> | undefined
    favoriteUsers: ProfileWithAddress[]
    reactionUsers: ProfileWithAddress[]
    streams: Array<Stream<any>>
    beforeMessage?: JSX.Element
}

const CCAvatarTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        minWidth: 300
    }
})

export const MessageView = (props: MessageViewProps): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar()

    return (
        <ListItem
            sx={{
                wordBreak: 'break-word',
                alignItems: 'flex-start',
                flex: 1,
                gap: { xs: 1, sm: 2 }
            }}
            disablePadding
        >
            {props.message?.payload?.body && (
                <>
                    <CCAvatarTooltip
                        title={
                            <Box display="flex" flexDirection="column" alignItems="left" sx={{ m: 1 }} gap={1}>
                                <Grid container>
                                    <Grid item xs={10}>
                                        <CCAvatar
                                            alt={props.author?.payload.body.username}
                                            avatarURL={props.author?.payload.body.avatar}
                                            identiconSource={props.message.author}
                                            sx={{
                                                width: { xs: '38px', sm: '48px' },
                                                height: { xs: '38px', sm: '48px' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <FollowButton userCCID={props.message.author} />
                                    </Grid>
                                </Grid>
                                <Typography variant="h2">{props.author?.payload.body.username}</Typography>
                                <Typography variant="body1">{props.author?.payload.body.description}</Typography>
                                <></>
                                <Box>
                                    <Chip
                                        label={props.author?.author.slice(0, 10).concat('...')}
                                        color="primary"
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(String(props.author?.author))
                                            enqueueSnackbar('Copied', { variant: 'info' })
                                        }}
                                    />
                                </Box>
                            </Box>
                        }
                    >
                        <IconButton
                            sx={{
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' },
                                mt: { xs: '3px', sm: '5px' }
                            }}
                            component={routerLink}
                            to={'/entity/' + props.message.author}
                        >
                            <CCAvatar
                                alt={props.author?.payload.body.username}
                                avatarURL={props.author?.payload.body.avatar}
                                identiconSource={props.message.author}
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' }
                                }}
                            />
                        </IconButton>
                    </CCAvatarTooltip>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            width: '100%',
                            overflow: 'auto'
                        }}
                    >
                        <MessageHeader
                            authorID={props.message.author}
                            messageID={props.message.id}
                            cdate={props.message.cdate}
                            username={props.author?.payload.body.username}
                        />
                        {props.beforeMessage}
                        <SimpleNote message={props.message} />
                        <MessageReactions message={props.message} emojiUsers={props.reactionUsers} />
                        <MessageActions
                            favoriteUsers={props.favoriteUsers}
                            message={props.message}
                            msgstreams={props.streams}
                            userCCID={props.userCCID}
                        />
                    </Box>
                </>
            )}
        </ListItem>
    )
}
