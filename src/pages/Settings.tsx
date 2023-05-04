import { Button, Divider, Typography, TextField, Box, useTheme } from '@mui/material'
import { useContext, useState } from 'react'
import { ApplicationContext } from '../App'
import { Themes } from '../themes'
import { Keygen, LoadKey } from '../util'

export interface SettingsProp {
    setThemeName: (themename: string) => void
    setServerAddr: (serverAddr: string) => void
    setUserAddr: (userAddr: string) => void
    setPubKey: (key: string) => void
    setPrvKey: (key: string) => void
}

export function Settings (props: SettingsProp): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)

    const [draftPrivateKey, setDraftPrivateKey] = useState<string>('')

    const regenerateKeys = (): void => {
        const key = Keygen()
        props.setPubKey(key.publickey)
        props.setPrvKey(key.privatekey)
        props.setUserAddr(key.ccaddress)
    }

    const importKeys = (): void => {
        const key = LoadKey(draftPrivateKey)
        props.setPubKey(key.publickey)
        props.setPrvKey(key.privatekey)
        props.setUserAddr(key.ccaddress)
    }

    return (<>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '20px', background: theme.palette.background.paper, minHeight: '100%' }}>
            <Typography variant="h5" gutterBottom>Settings</Typography>
            <Divider/>
            <Typography>Your concurrent address: {appData.userAddress}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '15px', gap: '5px' }}>
                <TextField label="server" variant="outlined" value={appData.serverAddress} onChange={(e) => { props.setServerAddr(e.target.value) }}/>
                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <TextField label="import private key" variant="outlined" value={draftPrivateKey} onChange={(e) => { setDraftPrivateKey(e.target.value) }}/>
                    <Button variant="contained" onClick={_ => { importKeys() }}>Import</Button>
                </Box>
                <Button color="error" variant="contained" onClick={_ => { regenerateKeys() }}>Generate New Key</Button>
            </Box>

            <Typography variant="h5">Theme</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gridAutoRows: '50px', gap: '10px' }}>
                {Object.keys(Themes).map(e =>
                    <Button
                        key={e}
                        variant="contained"
                        sx={{ background: (Themes as any)[e].palette.primary.main }}
                        onClick={(_) => { props.setThemeName(e) }}
                    >{e}</Button>
                )}
            </Box>
        </Box>
    </>)
}
