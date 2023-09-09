import { Alert, AlertTitle, Box, Button, Typography, useTheme } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../theming/Passport'
import { type ConcurrentTheme } from '../../model'
import { Link as RouterLink } from 'react-router-dom'
import { type Identity } from '../../util'

export function RegistrationWelcome(props: { next: () => void; identity: Identity }): JSX.Element {
    const theme = useTheme<ConcurrentTheme>()
    return (
        <>
            <Alert severity="info">
                <AlertTitle>Concurrentは現在開発中のソフトウェアです。</AlertTitle>
                絶賛機能追加途中で説明も少ないです。観光程度に遊んでもらえると嬉しいです！
            </Alert>

            <Box
                sx={{
                    padding: '30px',
                    maxWidth: '600px',
                    margin: 'auto'
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <PassportRenderer
                        theme={theme}
                        ccid={props.identity.CCID}
                        name={''}
                        avatar={''}
                        host={''}
                        cdate={''}
                        trust={0}
                    />
                </Tilt>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Button
                    variant="contained"
                    onClick={(): void => {
                        props.next()
                    }}
                >
                    IDカードを作成する
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px'
                }}
            >
                <Typography>もうアカウントを持っている？</Typography>
                <Button variant="contained" component={RouterLink} to="/import">
                    アカウントのインポート
                </Button>
            </Box>
        </>
    )
}
