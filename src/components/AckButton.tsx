import { Button, IconButton } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { type User } from '@concurrent-world/client'
import { ApplicationContext } from '../App'
import { useTranslation } from 'react-i18next'

export interface AckButtonProps {
    user: User
}

export const AckButton = (props: AckButtonProps): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const myAck = useMemo(() => {
        return appData.acklist.find((ack) => ack.ccid === props.user.ccid)
    }, [appData.acklist, props.user.ccid])

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
                        props.user.UnAck().then(() => {
                            appData.updateAcklist()
                        })
                    } else {
                        props.user.Ack().then(() => {
                            appData.updateAcklist()
                        })
                    }
                }}
            >
                {myAck ? (isHovered ? t('unfollow') : t('following')) : t('follow')}
            </Button>
        </>
    )
}
