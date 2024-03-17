import { Alert, AlertTitle, Box, Paper, Typography } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../theming/Passport'
import { type Identity } from '../../util'
import { useTranslation } from 'react-i18next'
import { IconButtonWithLabel } from '../ui/IconButtonWithLabel'

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import BuildIcon from '@mui/icons-material/Build'

export function RegistrationWelcome(props: {
    customSetup: () => void
    manualSetup: () => void
    identity: Identity
}): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'registration.welcome' })
    return (
        <>
            <Alert severity="info" sx={{ margin: '20px' }}>
                <AlertTitle>Concurrentは現在開発中のSNSです</AlertTitle>
                5月中にはベータ版を公開する予定ですが、その際にデータの移行が困難になる変更が入ることが予定されています。
                <br />
                今は観光程度にお楽しみいただけると嬉しいです！
            </Alert>
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

            <Typography
                variant="h4"
                sx={{
                    textAlign: 'center',
                    marginY: '20px'
                }}
            >
                作成方法を選んでください
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        width: '90%',
                        maxWidth: '800px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer'
                    }}
                    onClick={props.manualSetup}
                >
                    <IconButtonWithLabel icon={AutoFixHighIcon} label={'おまかせ'} />
                    <Typography
                        sx={{
                            flex: 1,
                            textAlign: 'center'
                        }}
                    >
                        あなたのデータを保持するサーバーを自動で選択します
                    </Typography>
                </Paper>
                <Paper
                    variant="outlined"
                    sx={{
                        width: '90%',
                        maxWidth: '800px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer'
                    }}
                    onClick={props.customSetup}
                >
                    <IconButtonWithLabel icon={BuildIcon} label={'カスタム'} />
                    <Typography
                        sx={{
                            flex: 1,
                            textAlign: 'center'
                        }}
                    >
                        自分でサーバーを選択してセットアップします
                        <br />
                        ※現在は自分でサーバーを建てた人向け
                    </Typography>
                </Paper>
            </Box>
        </>
    )
}
