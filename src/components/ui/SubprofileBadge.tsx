import { type CoreProfile } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { Avatar, type SxProps, Tooltip, Skeleton } from '@mui/material'
import BoringAvatar from 'boring-avatars'
import { useGlobalActions } from '../../context/GlobalActions'

export interface SubprofileBadgeProps {
    characterID: string
    authorCCID: string
    onClick?: (characterID: string) => void
    sx?: SxProps
    enablePreview?: boolean
}

export function SubprofileBadge(props: SubprofileBadgeProps): JSX.Element {
    const { client } = useClient()
    const actions = useGlobalActions()
    const [character, setProfile] = useState<CoreProfile<any> | null>(null)

    useEffect(() => {
        client.api.getProfileByID(props.characterID, props.authorCCID).then((character) => {
            setProfile(character ?? null)
        })
    }, [props.characterID])

    if (!character) return <Skeleton variant="rectangular" width={40} height={40} />

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
                onClick={() => {
                    if (props.enablePreview) {
                        actions?.openImageViewer(character?.document.body.avatar)
                    } else {
                        props.onClick?.(props.characterID)
                    }
                }}
            >
                <BoringAvatar square name={character?.document.body.username} variant="beam" size={1000} />
            </Avatar>
        </Tooltip>
    )
}
