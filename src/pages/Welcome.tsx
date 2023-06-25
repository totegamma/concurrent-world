import Box from '@mui/material/Box'
import { Themes, createConcurrentTheme } from '../themes'
import { Button, CssBaseline, Paper, ThemeProvider, Typography, darken } from '@mui/material'
import { ConcurrentLogo } from '../components/ConcurrentLogo'
import { useState } from 'react'
import { usePersistent } from '../hooks/usePersistent'
import type { ConcurrentTheme } from '../model'
import { Link } from 'react-router-dom'

export default function Welcome(): JSX.Element {
    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue2')
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))

    const themes: string[] = Object.keys(Themes)

    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(createConcurrentTheme(newThemeName))
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    gap: '20px',
                    width: '100vw',
                    minHeight: '100dvh',
                    flexDirection: 'column',
                    padding: '20px',
                    background: [
                        theme.palette.background.default,
                        `linear-gradient(${theme.palette.background.default}, ${darken(
                            theme.palette.background.default,
                            0.1
                        )})`
                    ]
                }}
            >
                <Box sx={{ display: 'flex', gap: '30px', justifyContent: 'space-between' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Box>
                            <ConcurrentLogo
                                size="25px"
                                upperColor={theme.palette.background.contrastText}
                                lowerColor={theme.palette.background.contrastText}
                                frameColor={theme.palette.background.contrastText}
                            />
                        </Box>
                        <Typography
                            sx={{
                                color: 'background.contrastText',
                                fontSize: '25px'
                            }}
                        >
                            Concurrent
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '10px'
                        }}
                    >
                        <Button variant="contained" component={Link} to="/register">
                            新しくはじめる
                        </Button>
                        <Button variant="contained" component={Link} to="/import">
                            アカウントインポート
                        </Button>
                    </Box>
                </Box>
                <Button
                    disableRipple
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        textTransform: 'none',
                        '&:hover': {
                            background: 'none'
                        }
                    }}
                    onClick={randomTheme}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            mt: '30px'
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'background.contrastText',
                                fontSize: '40px',
                                mb: '30px'
                            }}
                        >
                            世界はひとつ。環境は無数。
                        </Typography>
                    </Box>
                    <Typography
                        sx={{
                            color: 'background.contrastText',
                            fontSize: '20px',
                            mb: '30px'
                        }}
                    >
                        Concurrentはどの顔のあなたも楽しめる、ちょっと変わった分散型SNSです。
                    </Typography>
                </Button>

                <Paper
                    sx={{
                        display: 'flex',
                        gap: '30px',
                        flexDirection: 'column',
                        padding: '20px'
                    }}
                >
                    <Typography variant="h1">話題ごとのタイムライン</Typography>
                    <Typography>
                        Concurrentは「ストリーム」と呼ばれる、共有のタイムラインがたくさんあります。
                        従来SNSの、「このアカウントのフォロワーにこういう話をするのはちょっと・・・」という気持ちから複数アカウントを切り替える煩雑さからオサラバ。
                        好きな話題を、ふわさしいストリームで興味のある人同士で集まって盛り上がりましょう。
                        また、ストリームを複数フォローして、自分だけのホームタイムラインを作り上げることができます。
                    </Typography>
                </Paper>
                <Paper
                    sx={{
                        display: 'flex',
                        gap: '30px',
                        flexDirection: 'column',
                        padding: '20px'
                    }}
                >
                    <Typography variant="h1">あなたの発言はあなたのもの</Typography>
                    <Typography>
                        多くのサービスでは突然アカウントが凍結されて、あなたのデータが奪われてしまうことがあります。
                        Concurrentは分散型なので、自身の信頼できるサーバーを選ぶことができます。もちろん、ご自身で建ててもいいですよ！
                        ストリームのモデレーターはストリームからあなたの発言を除去することはできても、あなたの発言そのものは削除できません。
                        パブリックなストリームから投稿が取り除かれても、あなたのフォロワーにはあなたの発言を届けることができます。
                        モデレーションと権利の両方のバランスを取っているのがConcurrentです。
                    </Typography>
                </Paper>
                <Paper
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        gap: '30px',
                        flexDirection: 'column',
                        padding: '20px',
                        background: 'none'
                    }}
                >
                    <Typography variant="h1" sx={{ color: 'background.contrastText' }}>
                        ありがちな疑問
                    </Typography>
                    <Typography variant="h2" sx={{ color: 'background.contrastText' }}>
                        分散型だから、サーバーごとにアカウントを作らないとそれぞれのローカルは見えないんじゃないの？
                    </Typography>
                    <Typography sx={{ color: 'background.contrastText' }}>
                        Concurrentは分散型ですが、「ローカルタイムライン」は存在しません。代わりに、「ストリーム」と呼ばれる共有のタイムラインがたくさんあります。
                        どのサーバーにアカウントを作っても、すべての(公開)ストリームに書き込むことができるため、ローカルタイムラインのためにそれぞれのサーバーごとにアカウントを作成する必要はありません。
                        純粋に、そのサーバーがどの程度信用できるか、どの国に設置されていてどのような法的な制限を受けるのかということだけに集中してサーバーを選ぶことができます。
                    </Typography>
                    <Typography variant="h2" sx={{ color: 'background.contrastText' }}>
                        フォロー数・フォロワー数は見れないの？
                    </Typography>
                    <Typography sx={{ color: 'background.contrastText' }}>
                        誰が誰をフォローしているのかはプライベートな情報です。あなただって、リアルで友達だから...
                        という理由でフォローしなくちゃいけない義理にも疲れたでしょう。
                        また、発言をフォロワーだけでなくストリームを見ている人にも届けられるConcurrentでは、フォロワー数はほとんど意味のない数字です。
                        代わりに、すてきな人を応援する気持ちとして、プロフィールにいいねを送ることができます。
                    </Typography>
                </Paper>
            </Box>
        </ThemeProvider>
    )
}
