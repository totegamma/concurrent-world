import Box from '@mui/material/Box'
import { Themes, loadConcurrentTheme } from '../themes'
import { Button, CssBaseline, IconButton, ThemeProvider, Typography } from '@mui/material'
import { useState } from 'react'
import { usePersistent } from '../hooks/usePersistent'
import type { ConcurrentTheme } from '../model'
import { NavLink } from 'react-router-dom'
import GitHubIcon from '@mui/icons-material/GitHub'
import AppMock from '../components/welcome/AppMock'
import { PassportRenderer } from '../components/theming/Passport'
import Tilt from 'react-parallax-tilt'
import { StreamCard } from '../components/Stream/Card'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import { useTranslation } from 'react-i18next'

export default function Welcome(): JSX.Element {
    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue')
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName))

    const themes: string[] = Object.keys(Themes)

    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(loadConcurrentTheme(newThemeName))
    }

    const { t } = useTranslation('', { keyPrefix: 'welcome' })

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    gap: 4,
                    width: '100vw',
                    maxWidth: '1024px',
                    margin: 'auto',
                    minHeight: '100dvh',
                    flexDirection: 'column',
                    padding: '20px',
                    color: 'background.contrastText'
                }}
            >
                <Box /* header */ sx={{ display: 'flex', gap: '30px', justifyContent: 'space-between' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <ConcurrentWordmark color={theme.palette.background.contrastText} />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '10px'
                        }}
                    >
                        <Button onClick={randomTheme}>✨</Button>

                        <Button component={NavLink} to="/import">
                            {t('import')}
                        </Button>
                    </Box>
                </Box>
                <Box /* top */ display="flex" flexDirection={{ xs: 'column', sm: 'column', md: 'row' }} gap={2}>
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
                <Box /* column */
                    display="flex"
                    flexDirection={{ xs: 'column-reverse', sm: 'column-reverse', md: 'row' }}
                    gap={2}
                >
                    <Box
                        sx={{
                            flex: 1,
                            width: '300px',
                            margin: 'auto'
                        }}
                    >
                        <Tilt glareEnable={true} glareBorderRadius="5%">
                            <PassportRenderer
                                theme={theme}
                                ccid={'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3'}
                                name={'Anonymous'}
                                avatar={''}
                                host={'dev.concurrent.world'}
                                cdate={'2023/02/04'}
                                trust={255}
                            />
                        </Tilt>
                    </Box>

                    <Box flex={1}>
                        <Typography gutterBottom variant="h1">
                            {t('feature1.title')}
                        </Typography>
                        <Typography>{t('feature1.description')}</Typography>
                    </Box>
                </Box>

                <Box /* column */ display="flex" flexDirection={{ xs: 'column', sm: 'column', md: 'row' }} gap={2}>
                    <Box flex={1}>
                        <Typography gutterBottom variant="h1">
                            {t('feature2.title')}
                        </Typography>
                        <Typography>{t('feature2.description')}</Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" flex={1} gap={1}>
                        <StreamCard
                            streamID="ci8qvhep9dcpltmfq3fg@hub.concurrent.world"
                            name="Arrival Lounge"
                            description="hub.concurrent.worldサーバーへようこそ！わからない事があれば、ここで呟いてみましょう。"
                            banner="https://cdn.discordapp.com/attachments/812107435833294868/1138120758493708348/image.png"
                            domain="hub.concurrent.world"
                        />
                        <StreamCard
                            streamID="chrmsgep9dcl7anfkgcg@dev.concurrent.world"
                            name="Dev Central"
                            description="開発者の憩い場"
                            banner="https://cdn.discordapp.com/attachments/812107435833294868/1138082112646418463/IMG_1983.jpg"
                            domain="dev.concurrent.world"
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
            </Box>
        </ThemeProvider>
    )
}
