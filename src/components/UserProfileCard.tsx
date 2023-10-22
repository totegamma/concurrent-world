import { type User } from '@concurrent-world/client'
import { Box, Chip, Typography } from '@mui/material'
import { CCAvatar } from './ui/CCAvatar'
import { useApi } from '../context/api'
import { AckButton } from './AckButton'
import { FollowButton } from './FollowButton'
import { useSnackbar } from 'notistack'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'

export interface UserProfileCardProps {
    user: User
}

export const UserProfileCard = (props: UserProfileCardProps): JSX.Element => {
    const client = useApi()
    const isSelf = props.user.ccid === client?.ccid
    const { enqueueSnackbar } = useSnackbar()

    return (
        <Box display="flex" flexDirection="column" alignItems="left" sx={{ m: 1 }} gap={1}>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                <CCAvatar
                    alt={props.user.profile?.username}
                    avatarURL={props.user.profile?.avatar}
                    identiconSource={props.user.ccid}
                    sx={{
                        width: { xs: '38px', sm: '48px' },
                        height: { xs: '38px', sm: '48px' }
                    }}
                />
                {!isSelf && (
                    <Box display="flex" gap={1} flexDirection="row" alignItems="center">
                        <AckButton user={props.user} />
                        <FollowButton
                            userCCID={props.user.ccid}
                            userStreamID={props.user.userstreams?.homeStream ?? ''}
                            color="primary.main"
                        />
                    </Box>
                )}
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent="space-between">
                <Typography variant="h2">{props.user.profile?.username}</Typography>
                <Chip
                    size="small"
                    label={`${props.user.ccid.slice(0, 9)}...`}
                    deleteIcon={<ContentPasteIcon />}
                    onDelete={() => {
                        navigator.clipboard.writeText(props.user.ccid)
                        enqueueSnackbar('Copied', { variant: 'info' })
                    }}
                />
            </Box>
            <Typography variant="body1">{props.user.profile?.description}</Typography>
        </Box>
    )
}
