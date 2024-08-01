import Box from '@mui/material/Box'
import { Button, IconButton, Typography } from '@mui/material'
import { Link, NavLink } from 'react-router-dom'
import GitHubIcon from '@mui/icons-material/GitHub'
import AppMock from '../components/welcome/AppMock'
import { StreamCard } from '../components/Stream/Card'
import { useTranslation } from 'react-i18next'
import { GuestBase } from '../components/GuestBase'
import Contributors from '../components/welcome/Contributors'

export default function Welcome(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'welcome' })

    return (
        <GuestBase
            header
            sx={{
                display: 'flex',
                gap: 4,
                width: '100%',
                maxWidth: '1280px',
                margin: 'auto',
                flexDirection: 'column',
                padding: '20px',
                color: 'text.primary',
                backgroundColor: 'background.paper'
            }}
            additionalButton={
                <>
                    <Button
                        component={Link}
                        to="https://square.concrnt.net/general/world/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ユーザーガイド
                    </Button>
                    <Button component={Link} to="/import">
                        {t('import')}
                    </Button>
                </>
            }
        >
            <Box /* top */
                display="flex"
                minHeight="50vh"
                flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
                gap={2}
                alignItems="center"
            >
                <Box flex={1}>
                    <Typography variant="h1" fontSize="50px">
                        {t('tagline1')}
                    </Typography>
                    <Typography variant="h1" fontSize="50px" gutterBottom>
                        {t('tagline2')}
                    </Typography>
                    <Typography>{t('description')}</Typography>
                    <Button
                        component={NavLink}
                        to="/register"
                        sx={{
                            marginTop: '20px',
                            width: '100%'
                        }}
                    >
                        {t('createAccount')}
                    </Button>
                    <Box pt={2}>
                        <Typography gutterBottom variant="h3">
                            {t('wip.title')}
                        </Typography>
                        <Typography>{t('wip.description')}</Typography>
                        <Typography>{t('wip.contribute')}</Typography>

                        <Typography gutterBottom variant="h3" mt={1}>
                            {t('wip.milestones.title')}
                        </Typography>
                        <Typography>{t('wip.milestones.item1')}</Typography>
                        <Typography>{t('wip.milestones.item2')}</Typography>
                        <Typography>{t('wip.milestones.item3')}</Typography>
                        <Typography>{t('wip.milestones.item4')}</Typography>
                        <Typography>{t('wip.milestones.item5')}</Typography>
                    </Box>
                </Box>

                <Box flex={1}>
                    <AppMock />
                </Box>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
                minHeight="50vh"
                justifyContent="center"
                mb="5vh"
            >
                <Typography variant="h1" fontSize="40px" sx={{ textAlign: 'center' }}>
                    {t('mission.title1')}
                    <br />
                    {t('mission.title2')}
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography sx={{ textAlign: 'center' }}>
                        {t('mission.body1')}
                        <br />
                        {t('mission.body2')}
                    </Typography>

                    <Typography sx={{ textAlign: 'center' }}>{t('mission.body3')}</Typography>

                    <Typography sx={{ textAlign: 'center' }}>{t('mission.body4')}</Typography>

                    <Typography sx={{ textAlign: 'center' }}>{t('mission.body5')}</Typography>
                </Box>
                <Contributors />
            </Box>

            <Box /* column */
                display="flex"
                flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
                gap={2}
                width="100%"
                minHeight="50vh"
            >
                <Box flex={1} display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h1" fontSize="40px">
                        {t('feature1.title')}
                    </Typography>
                    <Typography>{t('feature1.body1')}</Typography>

                    <Typography gutterBottom variant="h1" fontSize="40px">
                        {t('feature2.title')}
                    </Typography>
                    <Typography>{t('feature2.body1')}</Typography>
                    <Typography>{t('feature2.body2')}</Typography>
                </Box>
                <Box display="flex" gap={1} overflow="auto" flexDirection={{ xs: 'row', sm: 'row', md: 'column' }}>
                    <StreamCard
                        sx={{ minWidth: '300px' }}
                        streamID="tar69vv26r5s4wk0r067v20bvyw@ariake.concrnt.net"
                        name="Arrival Lounge"
                        description="hub.concurrent.worldサーバーへようこそ！わからない事があれば、ここで呟いてみましょう。"
                        banner="https://worldfile.cc/CC2d97694D850Df2089F48E639B4795dD95D2DCE2E/f696009d-f1f0-44f8-83fe-6387946f1b86"
                        domain="ariake.concrnt.net"
                    />
                    <StreamCard
                        sx={{ minWidth: '300px' }}
                        streamID="tdvtb8ha1d1pbckx3067v1wv8xr@denken.concrnt.net"
                        name="Dev Central"
                        description="開発者の憩い場"
                        banner="https://worldfile.cc/CC2d97694D850Df2089F48E639B4795dD95D2DCE2E/16e8e34f-460f-4a01-b0d1-6d0661a18ca4"
                        domain="denken.concrnt.net"
                    />
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography gutterBottom variant="h1">
                    {t('gettingStarted')}
                </Typography>
                <Button
                    component={NavLink}
                    to="/register"
                    sx={{
                        marginTop: '20px',
                        width: '100%'
                    }}
                >
                    {t('createAccount')}
                </Button>
            </Box>

            <Box /* footer */ display="flex" justifyContent="flex-end" alignItems="center" gap="10px">
                <Typography>You can contribute ;)</Typography>
                <IconButton
                    color="primary"
                    href="https://github.com/totegamma/concurrent-web"
                    target="_blank"
                    sx={{
                        padding: '0px'
                    }}
                >
                    <GitHubIcon fontSize="large" />
                </IconButton>
            </Box>
        </GuestBase>
    )
}
