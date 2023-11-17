import { type User } from '@concurrent-world/client'
import { Box, Chip, Typography } from '@mui/material'
import { CCAvatar } from './ui/CCAvatar'
import { useApi } from '../context/api'
import { AckButton } from './AckButton'
import { FollowButton } from './FollowButton'
import { useSnackbar } from 'notistack'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import { MarkdownRenderer } from './ui/MarkdownRenderer'
import Background from '../resources/defaultbg.png'

export interface UserProfileCardProps {
    user: User | undefined
}

export const UserProfileCard = (props: UserProfileCardProps): JSX.Element => {
    const client = useApi()
    const isSelf = props.user?.ccid === client?.ccid
    const { enqueueSnackbar } = useSnackbar()

    if (!props.user) return <></>

    return (
        <Box display="flex" flexDirection="column" maxWidth="500px">
            <Box
                sx={{
                    backgroundImage: `url(${props.user.profile?.payload.body.banner || Background})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    height: '80px'
                }}
            />
            <Box position="relative" height={0}>
                <Box
                    position="relative"
                    sx={{
                        top: '-30px',
                        left: '10px'
                    }}
                >
                    <CCAvatar
                        alt={props.user.profile?.payload.body.username}
                        avatarURL={props.user.profile?.payload.body.avatar}
                        identiconSource={props.user.ccid ?? ''}
                        sx={{
                            width: '60px',
                            height: '60px'
                        }}
                    />
                </Box>
            </Box>
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="flex-end"
                alignItems="center"
                height="40px"
                gap={1}
                px={1}
                mb={1}
            >
                {!isSelf && (
                    <>
                        <AckButton user={props.user} />
                        <FollowButton
                            userCCID={props.user.ccid}
                            userStreamID={props.user.userstreams?.payload.body.homeStream ?? ''}
                            color="primary.main"
                        />
                    </>
                )}
            </Box>
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                px={1}
                mb={1}
            >
                <Typography variant="h2">{props.user.profile?.payload.body.username}</Typography>
                <Chip
                    size="small"
                    label={`${props.user.ccid.slice(0, 9)}...`}
                    deleteIcon={<ContentPasteIcon />}
                    onDelete={() => {
                        navigator.clipboard.writeText(props.user?.ccid ?? '')
                        enqueueSnackbar('Copied', { variant: 'info' })
                    }}
                />
            </Box>
            <Box
                sx={{
                    maxHeight: '100px',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    px: 1,
                    mb: 1
                }}
            >
                <MarkdownRenderer messagebody={props.user.profile?.payload.body.description ?? ''} emojiDict={{}} />
            </Box>
        </Box>
    )
}
