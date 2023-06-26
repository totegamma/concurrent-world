import type { Meta } from '@storybook/react'
import { useState, useEffect } from 'react'
import type { CCID, ConcurrentTheme } from '../../../model'
import { createConcurrentTheme, Themes } from '../../../themes'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MessageView } from './MessageView'
import { CharacterProfileMock, MessageMock, StreamElementMock, StreamMock } from '../../../mock/modelmock'
import { ApiMock } from '../../../mock/apimock'
import { InspectorProvider, useInspector } from '../../../context/Inspector'
import Paper from '@mui/material/Paper'
import { type EmojiProps } from '../../EmojiPicker'

const ThemeList = Object.keys(Themes)

interface Props extends Meta {
    themeName: keyof typeof Themes
    body: string
    author: string
    cdate: string
    username: string
    streamName: string
}

const meta = {
    title: 'Components/MessageView',
    tags: [],
    argTypes: {
        themeName: {
            options: ThemeList,
            control: { type: 'select' }
        },
        body: {
            control: { type: 'text' }
        },
        author: {
            control: { type: 'text' }
        },
        cdate: {
            control: { type: 'date' }
        },
        username: {
            control: { type: 'text' }
        },
        streamName: {
            control: { type: 'text' }
        }
    },
    args: {
        themeName: 'basic',
        body: 'Hello World!',
        author: 'CCHogeHoge',
        username: 'Totegamma',
        cdate: '2023-06-06T00:15:21.43756+09:00',
        streamName: 'MockStreamName'
    }
} satisfies Meta<Props>

export default meta

export const Default = (arg: Props): JSX.Element => {
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(arg.themeName ?? 'basic'))
    const inspector = useInspector()

    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)
    const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null)

    useEffect(() => {
        setTheme(createConcurrentTheme(arg.themeName ?? 'basic'))
    }, [arg.themeName])

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="*"
                    element={
                        <InspectorProvider>
                            <CssBaseline />
                            <ThemeProvider theme={theme}>
                                <Paper>
                                    <MessageView
                                        theme={theme}
                                        message={MessageMock(arg.body, arg.author, arg.cdate)}
                                        author={CharacterProfileMock(arg.username)}
                                        reactUsers={[]}
                                        emojiUsers={[]}
                                        hasOwnReaction={false}
                                        msgstreams={[StreamMock(arg.streamName)]}
                                        messageAnchor={messageAnchor}
                                        emojiPickerAnchor={emojiPickerAnchor}
                                        api={new ApiMock()}
                                        inspectHandler={() => {}}
                                        handleReply={async () => {}}
                                        handleReRoute={async () => {}}
                                        unfavorite={() => {}}
                                        favorite={async () => {}}
                                        setMessageAnchor={setMessageAnchor}
                                        setEmojiPickerAnchor={setEmojiPickerAnchor}
                                        setFetchSucceed={(success: boolean) => {}}
                                        addMessageReaction={async (emoji: EmojiProps) => {}}
                                    />
                                </Paper>
                            </ThemeProvider>
                        </InspectorProvider>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}
