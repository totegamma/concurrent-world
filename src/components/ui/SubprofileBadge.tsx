import { type CoreCharacter } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { Avatar, type SxProps, Tooltip } from '@mui/material'
import BoringAvatar from 'boring-avatars'

export interface SubprofileBadgeProps {
    characterID: string
    authorCCID: string
    onClick?: (characterID: string) => void
    sx?: SxProps
}

export function SubprofileBadge(props: SubprofileBadgeProps): JSX.Element {
    const { client } = useClient()

    const [character, setCharacter] = useState<CoreCharacter<any> | null>(null)

    useEffect(() => {
        client.api.getCharacterByID(props.characterID, props.authorCCID).then((character) => {
            setCharacter(character ?? null)
        })
    }, [props.characterID])

    return (
        <Tooltip arrow title={character?.document.body.username} placement="top">
            <Avatar
                alt={character?.document.body.username}
                src={character?.document.body.avatar}
                sx={{
                    ...props.sx,
                    borderRadius: 1
                }}
                variant="square"
                onClick={() => props.onClick?.(props.characterID)}
            >
                <BoringAvatar square name={character?.document.body.username} variant="beam" size={1000} />
            </Avatar>
        </Tooltip>
    )
}
