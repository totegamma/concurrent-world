import { Box, Divider, List, Paper, Tab, Tabs } from '@mui/material'
import { TimelineHeader } from '../TimelineHeader'

import ListIcon from '@mui/icons-material/List'
import { DummyMessageView } from '../Message/DummyMessageView'
import { useEffect, useState } from 'react'

export default function AppMock(): JSX.Element {
    const [tab, setTab] = useState(0)
    const data = mockData[tab]

    useEffect(() => {
        const interval = setInterval(() => {
            setTab((tab) => (tab + 1) % mockData.length)
        }, 5000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    return (
        <Paper
            sx={{
                flexGrow: '1',
                margin: { xs: 0.5, sm: 1 },
                mb: { xs: 0, sm: '10px' },
                display: 'flex',
                flexFlow: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                background: 'none',
                backgroundColor: 'background.paper'
            }}
        >
            <TimelineHeader title={data.listTitle} titleIcon={<ListIcon />} />

            <Tabs value={tab} textColor="secondary" indicatorColor="secondary">
                {mockData.map((e) => (
                    <Tab key={e.listTitle} label={e.listTitle} />
                ))}
            </Tabs>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    py: { xs: 1, sm: 1 },
                    px: { xs: 1, sm: 2 }
                }}
            >
                <List sx={{ flex: 1, width: '100%' }}>
                    {data.timeline.map((message, i) => (
                        <>
                            <DummyMessageView
                                key={i}
                                message={message.message}
                                user={message.user}
                                userCCID={message.ccid}
                            />
                            <Divider />
                        </>
                    ))}
                </List>
            </Box>
        </Paper>
    )
}

const mockData = [
    {
        listTitle: 'ホーム',
        timeline: [
            {
                ccid: 'solitudeSam',
                user: {
                    username: 'solitudeSam'
                },
                message: {
                    body: 'この時間の静かさ、ほんとに好き。休日はひとりの時間が一番。'
                }
            },
            {
                ccid: 'geekyTom',
                user: {
                    username: 'geekyTom'
                },
                message: {
                    body: '音楽といえば、最近アニソンが頭から離れない。聴くとなんかテンション上がる。'
                }
            },
            {
                ccid: 'cozyCara',
                user: {
                    username: 'cozyCara'
                },
                message: {
                    body: '昼下がりの音楽セレクト、今日は何を聴こう。ちょっと悩むな。'
                }
            },
            {
                ccid: 'bookwormLiz',
                user: {
                    username: 'bookwormLiz'
                },
                message: {
                    body: '新しい本が届いた！紅茶を淹れて読書の時間。最高の休日。'
                }
            },
            {
                ccid: 'geekyTom',
                user: {
                    username: 'geekyTom'
                },
                message: {
                    body: '今日は久々に好きなアニメの再放送。これからまったり視聴タイム。'
                }
            }
        ]
    },
    {
        listTitle: 'ゲーム界隈',
        timeline: [
            {
                ccid: 'MechaMaster88',
                user: {
                    username: 'MechaMaster88'
                },
                message: {
                    body: '『魔界の冒険者』のセーブデータ、消失…。泣きたい。'
                }
            },
            {
                ccid: 'CtrlAltDefeat_',
                user: {
                    username: 'CtrlAltDefeat_'
                },
                message: {
                    body: 'VRゲームの新作、現実感がすごい！酔わないよう気をつけないと。'
                }
            },
            {
                ccid: 'GamerGalaxy_',
                user: {
                    username: 'GamerGalaxy_'
                },
                message: {
                    body: '昨晩のオンラインバトル、完璧な連携だった。次も頼むぞ、チーム！'
                }
            },
            {
                ccid: 'retroReveler',
                user: {
                    username: 'retroReveler'
                },
                message: {
                    body: '古いアーケードゲームを発見。コイン入れてプレイする感覚、懐かしい。'
                }
            },
            {
                ccid: 'bitBard',
                user: {
                    username: 'bitBard'
                },
                message: {
                    body: 'ゲームのOST集めるのが趣味。今日は新しい1枚ゲット！'
                }
            }
        ]
    },
    {
        listTitle: 'ごはん',
        timeline: [
            {
                ccid: 'TofuTribe',
                user: {
                    username: 'TofuTribe'
                },
                message: {
                    body: '手作りのビーガン料理に挑戦中。今日はトマトとキヌアのサラダ。'
                }
            },
            {
                ccid: 'SpiceSeeker_',
                user: {
                    username: 'SpiceSeeker_'
                },
                message: {
                    body: '新しいスパイスショップを発見！エキゾチックな味で実験開始。'
                }
            },
            {
                ccid: 'NoodleNomad',
                user: {
                    username: 'NoodleNomad'
                },
                message: {
                    body: '今日のラーメン、絶品だった。辛さがちょうど良い。'
                }
            },
            {
                ccid: 'BrewedLife',
                user: {
                    username: 'BrewedLife'
                },
                message: {
                    body: '自家製のコールドブリュー、夏の定番。コーヒー豆の選び方が鍵。'
                }
            },
            {
                ccid: 'CrispyCritic_',
                user: {
                    username: 'CrispyCritic_'
                },
                message: {
                    body: 'お店で食べた焼き鳥、外はサクサク、中はジューシー。次は友達を連れて行く！'
                }
            }
        ]
    }
]
