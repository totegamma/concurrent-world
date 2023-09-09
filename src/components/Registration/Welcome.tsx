import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material"
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from "../theming/Passport"


export function RegistrationWelcome(props: {next: ()=>void}): JSX.Element {
    return (<>
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
                    ccid={CCID}
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
            <Button variant="contained" component={Link} to="/import">
                アカウントのインポート
            </Button>
        </Box>

    </>)
}

