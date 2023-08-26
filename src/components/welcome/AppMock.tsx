import { Box, Divider, List, Paper, Tab, Tabs } from '@mui/material'
import { TimelineHeader } from '../TimelineHeader'

import ListIcon from '@mui/icons-material/List'
import { MessageView } from '../Message/MessageView'
import { Schemas } from '@concurrent-world/client'
import { useEffect, useState } from 'react'

const basicMessage = {
    id: '0',
    schema: Schemas.simpleNote,
    author: {
        ccid: '',
        tag: '',
        domain: '',
        cdate: '',
        score: 0
    },
    cdate: new Date(),
    streams: [],
    favorites: [],
    reactions: [],
    replies: [],
    reroutes: [],
    body: 'Hello, World!'
}

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
                            <MessageView key={i} message={message} userCCID="" />
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
                ...basicMessage,
                author: {
                    ccid: 'solitudeSam',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'solitudeSam'
                },
                body: 'この時間の静かさ、ほんとに好き。休日はひとりの時間が一番。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'geekyTom',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'geekyTom'
                },
                body: '音楽といえば、最近アニソンが頭から離れない。聴くとなんかテンション上がる。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'cozyCara',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'cozyCara'
                },
                body: '昼下がりの音楽セレクト、今日は何を聴こう。ちょっと悩むな。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'bookwormLiz',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'bookwormLiz'
                },
                body: '新しい本が届いた！紅茶を淹れて読書の時間。最高の休日。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'geekyTom',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'geekyTom'
                },
                body: '今日は久々に好きなアニメの再放送。これからまったり視聴タイム。'
            }
        ]
    },
    {
        listTitle: 'ゲーム界隈',
        timeline: [
            {
                ...basicMessage,
                author: {
                    ccid: 'MechaMaster88',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'MechaMaster88'
                },
                body: '『魔界の冒険者』のセーブデータ、消失…。泣きたい。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'CtrlAltDefeat_',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'CtrlAltDefeat_'
                },
                body: 'VRゲームの新作、現実感がすごい！酔わないよう気をつけないと。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'GamerGalaxy_',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'GamerGalaxy_'
                },
                body: '昨晩のオンラインバトル、完璧な連携だった。次も頼むぞ、チーム！'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'retroReveler',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'retroReveler'
                },
                body: '古いアーケードゲームを発見。コイン入れてプレイする感覚、懐かしい。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'bitBard',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'bitBard'
                },
                body: 'ゲームのOST集めるのが趣味。今日は新しい1枚ゲット！'
            }
        ]
    },
    {
        listTitle: 'ごはん',
        timeline: [
            {
                ...basicMessage,
                author: {
                    ccid: 'TofuTribe',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'TofuTribe'
                },
                body: '手作りのビーガン料理に挑戦中。今日はトマトとキヌアのサラダ。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'SpiceSeeker_',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'SpiceSeeker_'
                },
                body: '新しいスパイスショップを発見！エキゾチックな味で実験開始。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'NoodleNomad',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'NoodleNomad'
                },
                body: '今日のラーメン、絶品だった。辛さがちょうど良い。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'BrewedLife',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'BrewedLife'
                },
                body: '自家製のコールドブリュー、夏の定番。コーヒー豆の選び方が鍵。'
            },
            {
                ...basicMessage,
                author: {
                    ccid: 'CrispyCritic_',
                    tag: '',
                    domain: '',
                    cdate: '',
                    score: 0
                },
                profileOverride: {
                    username: 'CrispyCritic_'
                },
                body: 'お店で食べた焼き鳥、外はサクサク、中はジューシー。次は友達を連れて行く！'
            }
        ]
    }
]
