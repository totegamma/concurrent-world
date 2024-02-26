import { Avatar, Badge, type SxProps } from '@mui/material'
import BoringAvatar from 'boring-avatars'
import { useApi } from '../../context/api'
import { useEffect, useState } from 'react'
import { type CoreCharacter } from '@concurrent-world/client'

export interface CCAvatarProps {
    sx?: SxProps
    alt?: string
    avatarURL?: string
    avatarOverride?: string
    identiconSource?: string
    characterOverride?: string
    onBadgeClick?: () => void
}

export const CCAvatar = (props: CCAvatarProps): JSX.Element => {
    const client = useApi()
    const [characterOverride, setCharacterOverride] = useState<CoreCharacter<any> | undefined>(undefined)

    useEffect(() => {
        if (!(client && props.characterOverride && props.identiconSource)) return
        client.api.getCharacterByID(props.characterOverride, props.identiconSource).then((character) => {
            setCharacterOverride(character ?? undefined)
        })
    }, [props.characterOverride])

    return (
        <Badge
            overlap="circular"
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
            }}
            badgeContent={
                (characterOverride?.payload.body.avatar || props.avatarOverride) && (
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
                src={characterOverride?.payload.body.avatar ?? props.avatarOverride ?? props.avatarURL}
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
