import { Tooltip, Paper, Chip } from '@mui/material'
import { UserProfileCard } from '../UserProfileCard'
import { type User } from '@concurrent-world/client'
import { Link as NavLink } from 'react-router-dom'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { useApi } from '../../context/api'
import { useEffect, useState } from 'react'

export interface CCUserChipProps {
    user?: User
    ccid?: string
    iconOverride?: JSX.Element
}

export const CCUserChip = (props: CCUserChipProps): JSX.Element => {
    const api = useApi()
    const [user, setUser] = useState<User | null | undefined>(props.user)

    useEffect(() => {
        if (user !== undefined) return
        if (!props.ccid) return
        api.getUser(props.ccid).then((user) => {
            setUser(user)
        })
    }, [])

    return (
        <Tooltip
            enterDelay={500}
            enterNextDelay={500}
            leaveDelay={300}
            placement="top"
            components={{
                Tooltip: Paper
            }}
            componentsProps={{
                tooltip: {
                    sx: {
                        m: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minWidth: '300px'
                    }
                }
            }}
            title={<UserProfileCard user={user ?? undefined} />}
        >
            <Chip
                component={NavLink}
                to={'/entity/' + (user?.ccid ?? '')}
                size={'small'}
                label={user?.profile?.payload.body.username ?? 'anonymous'}
                icon={props.iconOverride ?? <AlternateEmailIcon fontSize="small" />}
            />
        </Tooltip>
    )
}
