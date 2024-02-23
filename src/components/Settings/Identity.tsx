import { Alert, Box, Divider } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { Passport } from '../theming/Passport'
import { Suspense, lazy } from 'react'

const SwitchMasterToSub = lazy(() => import('../SwitchMasterToSub'))

export const IdentitySettings = (): JSX.Element => {
    const mnemonic = JSON.parse(localStorage.getItem('Mnemonic') || 'null')

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            <Box
                sx={{
                    padding: { xs: '10px', sm: '10px 50px' }
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <Passport />
                </Tilt>
            </Box>

            {mnemonic && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Alert severity="warning">
                        現在マスターキーを使ってログインしています。より安全なサブキーによるログインに今すぐ切り替えましょう。
                    </Alert>

                    <Suspense fallback={<>loading...</>}>
                        <SwitchMasterToSub mnemonic={mnemonic} />
                    </Suspense>
                </Box>
            )}
            {mnemonic === null && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Alert severity="info">現在サブキーでログインしています。</Alert>
                    <Divider />
                </Box>
            )}
        </Box>
    )
}
