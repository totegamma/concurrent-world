import { Box, Divider, Paper, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'

export default function SubkeyInfo(props: { subkey: string }): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'ui.secret' })
    const [reveal, setReveal] = useState(false)

    return (
        <Paper
            variant="outlined"
            style={{
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box
                style={{
                    width: '100%',
                    height: '120px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Typography
                    variant="h5"
                    style={{
                        flex: '1'
                    }}
                >
                    {props.subkey}
                </Typography>
                <Divider
                    orientation="vertical"
                    style={{
                        flex: '1'
                    }}
                />
                <Box
                    style={{
                        flex: '1',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <QRCode value={props.subkey} size={100} />
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    backgroundColor: 'text.primary',
                    color: 'background.paper',
                    padding: '3px 10px',
                    cursor: 'pointer',
                    display: reveal ? 'block' : 'none',
                    borderRadius: '0 0 4px 4px',
                    width: 'fit-content',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
                onClick={() => {
                    setReveal(false)
                }}
            >
                閉じる
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    display: reveal ? 'none' : 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    setReveal(true)
                }}
            >
                <Typography variant="h3">{t('clickToReveal')}</Typography>
                <Typography variant="caption">{t('warn')}</Typography>
            </Box>
        </Paper>
    )
}
