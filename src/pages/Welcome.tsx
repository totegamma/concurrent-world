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
            sx={{
                display: 'flex',
                gap: 4,
                width: '100vw',
                maxWidth: '1280px',
                margin: 'auto',
                minHeight: '100dvh',
                flexDirection: 'column',
                padding: '20px',
                color: 'background.contrastText'
            }}
            additionalButton={
                <Button component={Link} to="/import">
                    {t('import')}
                </Button>
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
                mb="10vh"
            >
                <Typography variant="h1" fontSize="40px" sx={{ textAlign: 'center' }}>
                    SNSアカウントをあなたの
                    <br />
                    「インターネット人格」として確立しましょう。
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography sx={{ textAlign: 'center' }}>
                        現代社会において、SNSアカウントの立ち位置は非常に重要です。
                        <br />
                        友達やファン・憧れの人との交流も、自分の活動の記録も、すべてがそこに詰まっているわけですから当たり前ですよね。
                    </Typography>

                    <Typography sx={{ textAlign: 'center' }}>
                        しかし、現代社会ではこのようにインターネット上の「人格」として存在している貴重なSNSアカウントは、一企業の気分次第で簡単に凍結されています。これは、到底許せることではないはずです。
                    </Typography>

                    <Typography sx={{ textAlign: 'center' }}>
                        Concurrentは暗号技術を用いて、あなたのアカウントの権利を運営団体ではなく「あなた自身で」責任を持って管理することができます。サーバーは、あなたのデータを配信する「お手伝い」をするだけです。
                    </Typography>

                    <Typography sx={{ textAlign: 'center' }}>
                        Concurrentで、あなたのインターネット人格を、自分の手で、誕生させましょう。
                    </Typography>
                </Box>
                <Contributors />
                {/*
                <Box display="flex" flexDirection="column" alignItems="center">
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
                */}
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
                        streamID="ci8qvhep9dcpltmfq3fg@hub.concurrent.world"
                        name="Arrival Lounge"
                        description="hub.concurrent.worldサーバーへようこそ！わからない事があれば、ここで呟いてみましょう。"
                        banner="https://worldfile.cc/CC2d97694D850Df2089F48E639B4795dD95D2DCE2E/f696009d-f1f0-44f8-83fe-6387946f1b86"
                        domain="hub.concurrent.world"
                    />
                    <StreamCard
                        sx={{ minWidth: '300px' }}
                        streamID="chrmsgep9dcl7anfkgcg@dev.concurrent.world"
                        name="Dev Central"
                        description="開発者の憩い場"
                        banner="https://worldfile.cc/CC2d97694D850Df2089F48E639B4795dD95D2DCE2E/16e8e34f-460f-4a01-b0d1-6d0661a18ca4"
                        domain="dev.concurrent.world"
                    />
                    {/*
                    <StreamCard
                        sx={{minWidth: '300px'}}
                        streamID="chrmskup9dcl7anfkge0@hub.concurrent.world"
                        name="ガジェット探索"
                        description="My New Gear......"
                        banner="https://worldfile.cc/CC2d97694D850Df2089F48E639B4795dD95D2DCE2E/077ff86b-99d6-4a96-9bc9-4ec1b59fd22e"
                        domain="dev.concurrent.world"
                    />
                    <StreamCard
                        sx={{minWidth: '300px'}}
                        streamID="ck4hekep9dcsa69ohmlg@hub.concurrent.world"
                        name="Nostr民"
                        description="Nostr民のたまり場"
                        banner=""
                        domain="hub.concurrent.world"
                    />
                    */}
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
