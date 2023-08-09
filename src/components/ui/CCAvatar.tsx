import { Avatar, type SxProps } from '@mui/material'
import BoringAvatar from 'boring-avatars'

export interface CCAvatarProps {
    sx?: SxProps
    alt?: string
    avatarURL?: string
    identiconSource: string
}

export const CCAvatar = (props: CCAvatarProps): JSX.Element => {
    return (
        <Avatar
            alt={props.alt}
            src={props.avatarURL}
            sx={{
                ...props.sx,
                borderRadius: 1
            }}
            variant="square"
        >
            <BoringAvatar square name={props.identiconSource} variant="beam" size={1000} />
        </Avatar>
    )
}
