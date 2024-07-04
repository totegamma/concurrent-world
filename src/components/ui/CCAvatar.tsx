import { Avatar, Badge, Skeleton, type SxProps } from '@mui/material'
import BoringAvatar from 'boring-avatars'

export interface CCAvatarProps {
    circle?: boolean
    sx?: SxProps
    alt?: string
    avatarURL?: string
    avatarOverride?: string
    identiconSource?: string
    onBadgeClick?: () => void
    isLoading?: boolean
}

export const CCAvatar = (props: CCAvatarProps): JSX.Element => {
    if (props.isLoading) {
        return <Skeleton variant="rectangular" sx={props.sx} />
    }

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
            onClick={() => props.onBadgeClick?.()}
        >
            <Avatar
                alt={props.alt}
                src={props.avatarOverride ?? props.avatarURL}
                sx={{
                    ...props.sx,
                    borderRadius: props.circle ? undefined : 1
                }}
                variant={props.circle ? 'circular' : 'square'}
            >
                <BoringAvatar square={!props.circle} name={props.identiconSource} variant="beam" size={1000} />
            </Avatar>
        </Badge>
    )
}
