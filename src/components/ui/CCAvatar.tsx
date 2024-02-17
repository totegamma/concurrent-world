import { Avatar, Badge, type SxProps } from '@mui/material'
import BoringAvatar from 'boring-avatars'

export interface CCAvatarProps {
    sx?: SxProps
    alt?: string
    avatarURL?: string
    avatarOverride?: string
    identiconSource?: string
}

export const CCAvatar = (props: CCAvatarProps): JSX.Element => {
    return (
        <Badge
            overlap="circular"
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
            }}
            badgeContent={
                props.avatarOverride && (
                    <CCAvatar
                        sx={{
                            width: 24,
                            height: 24
                        }}
                        identiconSource={props.identiconSource}
                        avatarURL={props.avatarURL}
                    />
                )
            }
        >
            <Avatar
                alt={props.alt}
                src={props.avatarOverride || props.avatarURL}
                sx={{
                    ...props.sx,
                    borderRadius: 1
                }}
                variant="square"
            >
                <BoringAvatar square name={props.identiconSource} variant="beam" size={1000} />
            </Avatar>
        </Badge>
    )
}
