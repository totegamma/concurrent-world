import { IconButton } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { type User } from '@concurrent-world/client'
import { ApplicationContext } from '../App'
import { useApi } from '../context/api'

export interface AckButtonProps {
    user: User
}

export const AckButton = (props: AckButtonProps): JSX.Element => {
    const client = useApi()
    const appData = useContext(ApplicationContext)
    const myAck = useMemo(() => {
        return appData.acklist.find((ack) => ack.payload.ccid === props.user.ccid)
    }, [appData.acklist, props.user.ccid])

    const [isHovered, setIsHovered] = useState(false)

    return (
        <>
            <IconButton
                onMouseEnter={() => {
                    setIsHovered(true)
                }}
                onMouseLeave={() => {
                    setIsHovered(false)
                }}
                onClick={() => {
                    if (myAck) {
                        client.unAckUser(myAck.id).then(() => {
                            appData.updateAcklist()
                        })
                    } else {
                        client.ackUser(props.user).then(() => {
                            appData.updateAcklist()
                        })
                    }
                }}
            >
                {myAck ? (
                    isHovered ? (
                        <PersonRemoveAlt1Icon color="error" />
                    ) : (
                        <CheckCircleIcon color="primary" />
                    )
                ) : (
                    <PersonAddAlt1Icon color="primary" />
                )}
            </IconButton>
        </>
    )
}
