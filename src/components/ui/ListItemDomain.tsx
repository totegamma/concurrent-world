import {
    Avatar,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    type SxProps
} from '@mui/material'
import { useEffect, useState } from 'react'
import { type CoreDomain } from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export interface ListItemDomainProps {
    domainFQDN: string
    sx?: SxProps
    onClick?: () => void
}

export const ListItemDomain = (props: ListItemDomainProps): JSX.Element | null => {
    const { client } = useClient()
    const [domain, setDomain] = useState<CoreDomain | null>(null)

    useEffect(() => {
        client.api.getDomain(props.domainFQDN).then((e) => {
            setDomain(e ?? null)
        })
    }, [props.domainFQDN])

    if (!domain) {
        return <></>
    }

    return (
        <Tooltip arrow followCursor title={domain.meta.description} placement="right">
            <ListItemButton dense sx={props.sx} onClick={props.onClick}>
                <ListItemAvatar>
                    <Avatar src={domain.meta.logo}></Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={`${domain.meta.nickname} (${domain.meta.registration})`}
                    secondary={domain.fqdn}
                />
                <ListItemIcon>
                    <OpenInNewIcon />
                </ListItemIcon>
            </ListItemButton>
        </Tooltip>
    )
}
