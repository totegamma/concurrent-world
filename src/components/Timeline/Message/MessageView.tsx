import { Box, IconButton, ListItem, Typography, Chip, Paper, Tooltip } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { useApi } from '../../../context/api'
import { CCAvatar } from '../../CCAvatar'
import type { M_Current } from '@concurrent-world/client'
import { SimpleNote } from '../SimpleNote'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import { useSnackbar } from 'notistack'
import { FollowButton } from '../../FollowButton'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'

export interface MessageViewProps {
    message: M_Current
    userCCID: string
    beforeMessage?: JSX.Element
    lastUpdated?: number
}

export const MessageView = (props: MessageViewProps): JSX.Element => {
    const client = useApi()
    const { enqueueSnackbar } = useSnackbar()
    const isSelf = props.message.author.ccaddr === client.ccid

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
            {props.message.body && (
                <>
                    <Tooltip
                        enterDelay={500}
                        enterNextDelay={500}
                        leaveDelay={300}
                        placement="top"
                        components={{
                            Tooltip: Paper
                        }}
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    p: 1,
                                    m: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    minWidth: '300px'
                                }
                            }
                        }}
                        title={
                            <Box display="flex" flexDirection="column" alignItems="left" sx={{ m: 1 }} gap={1}>
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <CCAvatar
                                        alt={props.message.author.profile.username}
                                        avatarURL={props.message.author.profile.avatar}
                                        identiconSource={props.message.author.ccaddr}
                                        sx={{
                                            width: { xs: '38px', sm: '48px' },
                                            height: { xs: '38px', sm: '48px' }
                                        }}
                                    />
                                    {!isSelf && (
                                        <FollowButton userCCID={props.message.author.ccaddr} color="primary.main" />
                                    )}
                                </Box>
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    alignItems="center"
                                    gap={1}
                                    justifyContent="space-between"
                                >
                                    <Typography variant="h2">{props.message.author.profile.username}</Typography>
                                    <Chip
                                        size="small"
                                        label={`${props.message.author.ccaddr.slice(0, 9)}...`}
                                        deleteIcon={<ContentPasteIcon />}
                                        onDelete={() => {
                                            navigator.clipboard.writeText(props.message.author.ccaddr)
                                            enqueueSnackbar('Copied', { variant: 'info' })
                                        }}
                                    />
                                </Box>
                                <Typography variant="body1">{props.message.author.profile.description}</Typography>
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
                            to={'/entity/' + props.message.author.ccaddr}
                        >
                            <CCAvatar
                                alt={props.message.author.profile.username}
                                avatarURL={props.message.author.profile.avatar}
                                identiconSource={props.message.author.ccaddr}
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' }
                                }}
                            />
                        </IconButton>
                    </Tooltip>
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
                            authorID={props.message.author.ccaddr}
                            messageID={props.message.id}
                            cdate={props.message.cdate}
                            username={props.message.author.profile.username}
                        />
                        {props.beforeMessage}
                        <SimpleNote message={props.message} />
                        <MessageReactions message={props.message} />
                        <MessageActions message={props.message} userCCID={props.userCCID} />
                    </Box>
                </>
            )}
        </ListItem>
    )
}
