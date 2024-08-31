import { Alert, Box, Button, AlertTitle, Paper, Typography } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../theming/Passport'
import { useTranslation } from 'react-i18next'
import { IconButtonWithLabel } from '../ui/IconButtonWithLabel'

import LaunchIcon from '@mui/icons-material/Launch'
import { type Identity } from '@concurrent-world/client'

export function RegistrationWelcome(props: {
    customSetup: () => void
    autoSetup: () => void
    identity: Identity
}): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'registration.welcome' })
    return (
        <>
            <Typography
                variant="h4"
                sx={{
                    textAlign: 'center',
                    wordBreak: 'keep-all'
                }}
            >
                Concrntは分散型SNSの1つです。
                <wbr />
                サーバーを選んで登録します。
            </Typography>
            <Box
                sx={{
                    padding: '20px',
                    maxWidth: '500px',
                    margin: 'auto'
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <PassportRenderer ccid={props.identity.CCID} name={''} avatar={''} host={''} cdate={''} trust={0} />
                </Tilt>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '90%',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}
            >
                <Alert severity="info">
                    <AlertTitle>どのサーバーでも大丈夫！</AlertTitle>
                    Concrntではサーバー間の隔たりがありません。携帯キャリアみたいなものです。
                    <br />
                    また、いつでもサーバー間の引っ越しが可能なので、こだわりがない場合はおまかせがオススメです。
                </Alert>

                <Button
                    id="RegistrationAutoSetupButton"
                    variant="contained"
                    sx={{
                        display: 'flex',
                        gap: 1,
                        p: 1,
                        width: '100%',
                        justifyContent: 'center'
                    }}
                    onClick={props.autoSetup}
                >
                    <Typography>
                        おまかせでサーバーを選んで
                        <wbr />
                        はじめる
                    </Typography>
                    <LaunchIcon />
                </Button>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <Button id="RegistrationCustomButton" variant="text" onClick={props.customSetup}>
                        自分でサーバーを選ぶ
                    </Button>
                </Box>
            </Box>
        </>
    )
}
