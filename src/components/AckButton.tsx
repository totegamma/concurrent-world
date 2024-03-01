import { Button } from '@mui/material'
import { useMemo, useState } from 'react'
import { type User } from '@concurrent-world/client'
import { useTranslation } from 'react-i18next'
import { useApi } from '../context/api'

export interface AckButtonProps {
    user: User
}

export const AckButton = (props: AckButtonProps): JSX.Element => {
    const client = useApi()
    const myAck = useMemo(() => {
        return client.ackings?.find((ack) => ack.ccid === props.user.ccid)
    }, [client, props.user.ccid])

    const [isHovered, setIsHovered] = useState(false)

    const { t } = useTranslation('', { keyPrefix: 'common' })

    return (
        <>
            <Button
                variant={myAck ? 'outlined' : 'contained'}
                onMouseEnter={() => {
                    setIsHovered(true)
                }}
                onMouseLeave={() => {
                    setIsHovered(false)
                }}
                onClick={() => {
                    if (myAck) {
                        props.user.UnAck()
                    } else {
                        props.user.Ack()
                    }
                }}
            >
                {myAck ? (isHovered ? t('unfollow') : t('following')) : t('follow')}
            </Button>
        </>
    )
}
