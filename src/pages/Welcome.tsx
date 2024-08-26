import Box from '@mui/material/Box'
import { Button, Divider, IconButton, Typography, alpha, useTheme } from '@mui/material'
import { Link, NavLink } from 'react-router-dom'
import GitHubIcon from '@mui/icons-material/GitHub'
import AppMock from '../components/welcome/AppMock'
import { useTranslation } from 'react-i18next'
import { GuestBase } from '../components/GuestBase'
import { StreamCard } from '../components/Stream/Card'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../components/theming/Passport'
import { DummyMessageView } from '../components/Message/DummyMessageView'

import { type Keyframes, keyframes } from '@emotion/react'
import styled from '@emotion/styled'

const parallaxKeyframes = (amount: number): Keyframes => keyframes`
    from {
        transform: translateY(0%);
    }
    to {
        transform: translateY(-${amount}%);
    }
`

interface ParallaxProps {
    parallaxAmount: number
}

const Parallax = styled.div<ParallaxProps>`
    position: absolute;
    animation: ${(props) => parallaxKeyframes(props.parallaxAmount)} linear;
    animation-timeline: scroll();
`

const decorations = [
    // left
    {
        username: 'SkylerJay',
        content: '使い方が新しいけどなれたら快適！',
        style: {
            top: '10%',
            left: '-10%'
        },
        parallax: 1000
    },
    {
        username: 'NovaPulse',
        content: '自分が依存するものは、オープンなものじゃなくっちゃね',
        style: {
            top: '20%',
            left: '-15%'
        },
        parallax: 100
    },
    {
        username: 'EchoBlaze',
        content: '複数のコミュニティに同時に発信したい！',
        style: {
            top: '35%',
            left: '-8%'
        },
        parallax: 100
    },
    {
        username: 'RiverStone',
        content: '自分でサーバー建ててみようかな？',
        style: {
            top: '43%',
            left: '-13%'
        },
        parallax: 500
    },
    {
        username: 'LunaDrift',
        content: '自分が分散しなくていい分散型SNSが欲しい！',
        style: {
            top: '60%',
            left: '-10%'
        },
        parallax: 1000
    },
    {
        username: 'ZephyrWind',
        content: 'いま、なにしてる？',
        style: {
            top: '50%',
            left: '0%'
        },
        parallax: 100
    },
    {
        username: 'CrystalWave',
        content: 'わいわい',
        style: {
            top: '90%',
            left: '-10%'
        },
        parallax: 100
    },

    // right
    {
        username: 'OrionShade',
        content: 'よるほー',
        style: {
            top: '8%',
            right: '-10%'
        },
        parallax: 100
    },
    {
        username: 'StarfallX',
        content: '誰か遊びに行こ！',
        style: {
            top: '18%',
            right: '-20%'
        },
        parallax: 100
    },
    {
        username: 'EmberGlow',
        content: 'テーマのカスタマイズが楽しい！',
        style: {
            top: '25%',
            right: '-17%'
        },
        parallax: 500
    },
    {
        username: 'SolarRay',
        content:
            '自分のアカウントが自分の手の内にあるから、<br/>安心してインターネットアイデンティティとして利用できる',
        style: {
            top: '50%',
            right: '-20%'
        },
        parallax: 100
    },
    {
        username: 'FrostWanderer',
        content: '絵文字リアクションでのコミュニケーションが快適！',
        style: {
            top: '38%',
            right: '-13%'
        },
        parallax: 100
    },
    {
        username: 'MirageVibe',
        content: 'いまいるサーバーが閉鎖しちゃっても、<br/>関係をそのまま引っ越せるから安心！',
        style: {
            top: '60%',
            right: '-8%'
        },
        parallax: 1000
    },

    {
        username: 'ZenithRift',
        content: 'おなかすいたYO',
        style: {
            top: '80%',
            right: '-20%'
        },
        parallax: 100
    },

    // special
    {
        username: 'totegamma',
        icon: 'https://github.com/totegamma.png',
        content: 'こういうの、あれ！',
        style: {
            top: '120%',
            left: '-10%'
        },
        parallax: 2000
    }
]

function WelcomeBody(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'welcome' })
    const theme = useTheme()

    return (
        <>
            <Box
                sx={{
                    height: '100dvh',
                    width: '100%',
                    maxWidth: '1280px',
                    position: 'fixed',
                    visibility: { xs: 'hidden', sm: 'hidden', md: 'visible' }
                }}
            >
                {decorations.map((decoration, i) => (
                    <Parallax
                        key={i}
                        style={{
                            ...decoration.style,
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: '4px',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            padding: '4px'
                        }}
                        parallaxAmount={decoration.parallax}
                    >
                        <DummyMessageView
                            userCCID={`${decoration.content}${i}`}
                            user={{
                                username: decoration.username,
                                avatar: decoration.icon
                            }}
                            message={{
                                body: decoration.content
                            }}
                            timestamp={<></>}
                            sx={{
                                opacity: '0.8',
                                color: 'gray'
                            }}
                        />
                    </Parallax>
                ))}
            </Box>

            <Box /* top */
                mt={{ xs: '50px', sm: '100px', md: '100px' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                    zIndex="1"
                    sx={{
                        backdropFilter: 'blur(2px)',
                        borderRadius: '10px',
                        padding: '20px'
                    }}
                >
                    <Typography variant="h1" fontSize={{ xs: '30px', sm: '40px', md: '50px' }} mb="50px" zIndex="1">
                        もし、こんなSNSがあったら...
                    </Typography>
                    <Box maxWidth="800px" display="flex" flexDirection="column" gap={2} zIndex="1">
                        <Typography variant="body1" align="center" fontSize={{ xs: '18px', sm: '20px', md: '20px' }}>
                            自分の友達や興味のある人が「いま、なにしてる」のかをリアルタイムで知れる。
                            <br />
                            1つのアカウントで、複数のコミュニティと交流できる。
                            <br />
                            運営が単一でなく、だれに管理をお願いするかを選べる。
                            <br />
                            そんなSNSが、あったらいいですよね。
                        </Typography>
                        <Typography variant="body1" align="center" fontSize={{ xs: '18px', sm: '20px', md: '20px' }}>
                            Concrntは、この願いにこたえるために開発されました。
                            <br />
                            新時代のSNSへ、ようこそ。
                        </Typography>
                    </Box>
                    <Button
                        size="large"
                        component={NavLink}
                        to="/register"
                        sx={{
                            marginTop: '20px'
                        }}
                    >
                        はじめる
                    </Button>
                </Box>
            </Box>

            <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
                gap={2}
                alignItems="center"
                p={2}
                sx={{
                    backdropFilter: 'blur(2px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }}
            >
                <Box flex={1} display="flex" flexDirection="column" gap={2}>
                    <Box>
                        <Typography variant="h1" fontSize="40px">
                            みんなで楽しむためのSNS
                        </Typography>
                        <Typography variant="caption" fontSize="15px">
                            知らない人しか流れてこないおすすめ欄に疲れた？
                        </Typography>
                        <Divider />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography>
                            知らない人しか流れてこないオススメより、自分の好きな人のことの方が、もっと知りたいですよね。
                        </Typography>

                        <Typography>
                            Concrntでは、アルゴリズムに任せるのではなく、自分でカスタマイズできるリスト機能を活用して、自分にとって本当に価値のある情報を手に入れることができます。好きな人、興味のあるコミュニティを選び、自分にピッタリなタイムラインを作り上げましょう。
                        </Typography>

                        <Typography>
                            Concrntは、あなたが本当に大切にしたいつながりを中心に据えた、みんなで楽しむためのSNSです。
                        </Typography>
                    </Box>
                </Box>
                <Box flex={1}>
                    <AppMock />
                </Box>
            </Box>

            <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'column', md: 'row-reverse' }}
                alignItems="center"
                gap={2}
                p={2}
                sx={{
                    backdropFilter: 'blur(2px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }}
            >
                <Box flex={1} display="flex" flexDirection="column" gap={2}>
                    <Box>
                        <Typography variant="h1" fontSize="40px">
                            あなたのアカウントはあなたのもの
                        </Typography>
                        <Typography variant="caption" fontSize="15px">
                            凍結に怯える日々とバイバイ👋
                        </Typography>
                        <Divider />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography>
                            Concrntは、ユーザーの自由と安全を最優先に考えた分散型SNSです。一つの企業や組織による独裁的な管理から解放され、複数の個人や組織が独立してサーバーを運営しています。
                        </Typography>

                        <Typography>
                            これにより、あなたのアカウントが突然凍結されるリスクに怯える必要はもうありません。仮に一つのサーバーで理不尽な対応を受けたとしても、別のサーバーへと簡単に移行でき、投稿やフォロワーをそのまま引き継いで活動を続けることが可能です。従来のSNSでは考えられなかった、自分自身で管理できる安心感と自由がここにあります。
                        </Typography>

                        <Typography>
                            Concrntでは、あなたのアカウントは本当に「あなたのもの」として存在します。
                        </Typography>
                    </Box>
                </Box>
                <Box flex={1}>
                    <Box minWidth="350px">
                        <Tilt glareEnable={true} glareBorderRadius="5%">
                            <PassportRenderer
                                ccid={''}
                                name={'<your name>'}
                                avatar={''}
                                host={'concrnt.world'}
                                cdate={'2023/02/04'}
                                trust={255}
                            />
                        </Tilt>
                    </Box>
                </Box>
            </Box>

            <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
                alignItems="center"
                gap={2}
                p={2}
                sx={{
                    backdropFilter: 'blur(2px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }}
            >
                <Box flex={2} display="flex" flexDirection="column" gap={2} p={2}>
                    <Box>
                        <Typography variant="h1" fontSize="40px">
                            1つのSNSで無数の居場所を
                        </Typography>
                        <Typography variant="caption" fontSize="15px">
                            趣味に合わせてアカウントを使い分ける時代は終わり
                        </Typography>
                        <Divider />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography>
                            Concrntでは、ホームタイムラインに加え、複数のコミュニティタイムラインを使い分けることができます。投稿時には、複数のコミュニティに同時に投稿できるため、人間にとって自然な「複数のコミュニティとゆるくつながる」ことが簡単に行えます。
                        </Typography>

                        <Typography>
                            Xのように世界と過剰につながりすぎることもなく、Discordのように閉じすぎることもない。適度に他のコミュニティと接続しながら、自分に合った居場所を見つけることができるのがConcrntの特徴です。
                        </Typography>
                    </Box>
                </Box>

                <Box
                    display="flex"
                    gap={1}
                    overflow="auto"
                    flexDirection={{ xs: 'row', sm: 'row', md: 'column' }}
                    flexShrink={1}
                >
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
        </>
    )
}

export default function Welcome(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'welcome' })

    return (
        <GuestBase
            header
            sx={{
                display: 'flex',
                gap: { xs: '50px', sm: '100px', md: '100px' },
                width: '100%',
                maxWidth: '1280px',
                margin: 'auto',
                flexDirection: 'column',
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
            <WelcomeBody />
        </GuestBase>
    )
}
