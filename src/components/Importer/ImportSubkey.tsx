import { Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Client } from '@concurrent-world/client'

export const ImportSubkey = (): JSX.Element => {
    const { t } = useTranslation('', { keyPrefix: 'import' })

    const [subkey, setSubkey] = useState<string>('')
    const [showSecret, setShowSecret] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>('')

    const [client, setClient] = useState<Client | null>(null)

    const accountImport = (): void => {
        if (client) {
            localStorage.setItem('Domain', JSON.stringify(client.host))
            localStorage.setItem('SubKey', JSON.stringify(subkey))
            window.location.href = '/'
        }
    }

    const checkLogin = (subkey: string): void => {
        if (subkey.startsWith('concurrent-subkey')) {
            try {
                Client.createFromSubkey(subkey).then((client) => {
                    setClient(client)
                })
            } catch (e) {
                setErrorMessage('Invalid subkey')
            }
        } else {
            setErrorMessage('Invalid subkey')
        }
        setSubkey(subkey)
    }

    return (
        <>
            <Typography variant="h3">サブキーでログイン</Typography>
            <TextField
                type={showSecret ? 'text' : 'password'}
                placeholder={'concurrent-subkey xxx CCxxx@example.com'}
                value={subkey}
                onChange={(e) => {
                    checkLogin(e.target.value)
                }}
                onPaste={() => {
                    setShowSecret(false)
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => {
                                    setShowSecret(!showSecret)
                                }}
                                color="primary"
                            >
                                {client ? <CheckCircleIcon /> : showSecret ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            {errorMessage}
            <Button disabled={!client} onClick={accountImport}>
                {t('import')}
            </Button>
        </>
    )
}
