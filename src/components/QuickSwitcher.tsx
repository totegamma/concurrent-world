import { Modal, Box, TextField, Paper, ThemeProvider } from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ApplicationContext } from '../App'
import { type IuseResourceManager } from '../hooks/useResourceManager'
import { Themes, createConcurrentTheme } from '../themes'
import { type ConcurrentTheme, type User } from '../model'

export interface QuickSwitcherProps {
    userDict: IuseResourceManager<User>
    setThemeName: (themename: string) => void
}

export function QuickSwitcher(props: QuickSwitcherProps): JSX.Element {
    const [openQuickSwitcher, setOpenQuickSwitcher] = useState<boolean>(false)
    const [draft, setDraft] = useState<string>('')

    const appData = useContext(ApplicationContext)

    const previewTheme: Record<string, ConcurrentTheme> = useMemo(
        () =>
            Object.fromEntries(
                Object.keys(Themes).map((e) => [e, createConcurrentTheme(e)])
            ),
        []
    )

    interface SearchItem {
        name: string
        path: string
    }

    const items: SearchItem[] = [
        {
            name: 'home',
            path: '/'
        },
        {
            name: 'notification',
            path: '/notification'
        },
        {
            name: 'associations',
            path: '/associations'
        },
        {
            name: 'explorer',
            path: '/explorer'
        },
        {
            name: 'identity',
            path: '/identity'
        },
        {
            name: 'settings',
            path: '/settings'
        }
    ]

    // Itemsをフィルター方法(renderのところに入れる)
    // {items.filter(item => item.name.match(draft)).map(item => <div>{item.name}</div>)}

    useEffect(() => {
        document.addEventListener('keyup', (e: any) => {
            // console.log(e)
            if (e.key === 'z' && e.ctrlKey === true) {
                setDraft('')
                setOpenQuickSwitcher(true)
            }

            // keyCode 27 = Escape
            if (e.keyCode === 27) {
                setOpenQuickSwitcher(false)
            }
        })
    }, [])

    return (
        <>
            <Modal
                open={openQuickSwitcher}
                onClose={() => {
                    setOpenQuickSwitcher(false)
                }}
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -70%)',
                        width: '60vw',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        background: 'none',
                        height: '30vh',
                        justifyContent: 'end',
                        overflow: 'hidden'
                    }}
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        console.log(window.location)
                        // window.location.href = `${window.location.origin}/${draft}`
                        props.setThemeName(
                            Object.keys(previewTheme).filter((key) =>
                                key.match(draft)
                            )[0]
                        )

                        setOpenQuickSwitcher(false)

                        // console.log(previewTheme)
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            padding: 2,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {Object.keys(previewTheme)
                            .filter((key) => key.match(draft))
                            .map((theme) => (
                                <div key={theme}>{theme}</div>
                            ))}
                    </Box>
                    <TextField
                        variant="filled"
                        value={draft}
                        sx={{
                            bgcolor: 'background.paper'
                        }}
                        onChange={(e) => {
                            setDraft(e.target.value)
                        }}
                        // onSubmit={e => {console.log('submit')}}
                        inputRef={(input) => input?.focus()}
                    ></TextField>
                </Paper>
            </Modal>
        </>
    )
}
