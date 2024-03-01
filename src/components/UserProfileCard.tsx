import { type CoreCharacter, type ProfileSchema, type User } from '@concurrent-world/client'
import { Box, Chip, Typography } from '@mui/material'
import { CCAvatar } from './ui/CCAvatar'
import { useClient } from '../context/ClientContext'
import { AckButton } from './AckButton'
import { useSnackbar } from 'notistack'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import { MarkdownRenderer } from './ui/MarkdownRenderer'
import { CCWallpaper } from './ui/CCWallpaper'

export interface UserProfileCardProps {
    user?: User
    character?: CoreCharacter<ProfileSchema>
}

export const UserProfileCard = (props: UserProfileCardProps): JSX.Element => {
    const { client } = useClient()
    const isSelf = props.user?.ccid === client?.ccid
    const { enqueueSnackbar } = useSnackbar()

    const character = props.user?.profile ?? props.character

    if (!character) return <></>

    return (
        <Box display="flex" flexDirection="column" maxWidth="500px">
            <CCWallpaper
                sx={{
                    height: '80px'
                }}
                override={character.payload.body.banner}
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
                        alt={character.payload.body.username}
                        avatarURL={character.payload.body.avatar}
                        identiconSource={character.author}
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
                {!isSelf && props.user && (
                    <>
                        <AckButton user={props.user} />
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
                <Typography variant="h2">{character.payload.body.username}</Typography>
                <Chip
                    size="small"
                    label={`${character.author.slice(0, 9)}...`}
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
                <MarkdownRenderer messagebody={character.payload.body.description ?? ''} emojiDict={{}} />
            </Box>
        </Box>
    )
}
