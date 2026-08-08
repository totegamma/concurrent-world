import Box from '@mui/material/Box'
import { Paper, Typography, alpha, useTheme } from '@mui/material'
import { QRCode } from 'react-qrcode-logo'
import { useTranslation } from 'react-i18next'
import SmartphoneIcon from '@mui/icons-material/Smartphone'
import appStoreBadge from '../../resources/appstore-badge.svg'
import googlePlayBadge from '../../resources/googleplay-badge.png'

const stores = [
    {
        label: 'Download on the App Store',
        badge: appStoreBadge,
        url: 'https://apps.apple.com/jp/app/concrnt-world/id6757524249'
    },
    {
        label: 'Get it on Google Play',
        badge: googlePlayBadge,
        url: 'https://play.google.com/store/apps/details?id=world.concrnt.app'
    }
]

export interface AppStoreQRProps {
    title?: string
    description?: string
}

export default function AppStoreQR(props: AppStoreQRProps): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'welcome' })
    const theme = useTheme()

    return (
        <Paper
            variant="outlined"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 3,
                maxWidth: '600px',
                width: '100%',
                zIndex: 1,
                backdropFilter: 'blur(2px)',
                backgroundColor: alpha(theme.palette.background.paper, 0.8)
            }}
        >
            <Box display="flex" alignItems="flex-start" gap={2}>
                <Box
                    sx={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.14),
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <SmartphoneIcon />
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography fontWeight={700}>{props.title ?? t('v2NoticeTitle')}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {props.description ?? t('v2NoticeDescription')}
                    </Typography>
                </Box>
            </Box>
            <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap">
                {stores.map((store) => (
                    <Box
                        key={store.label}
                        component="a"
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                            textDecoration: 'none'
                        }}
                    >
                        <Box
                            sx={{
                                padding: '8px',
                                borderRadius: 1,
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <QRCode
                                value={store.url}
                                size={288}
                                ecLevel="M"
                                quietZone={0}
                                style={{ width: '144px', height: '144px' }}
                                fgColor="#000000"
                                bgColor="#ffffff"
                                qrStyle="squares"
                                eyeRadius={0}
                            />
                        </Box>
                        <img src={store.badge} alt={store.label} style={{ height: '40px', width: 'auto' }} />
                    </Box>
                ))}
            </Box>
        </Paper>
    )
}
