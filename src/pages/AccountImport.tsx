import { Button } from '@mui/material'
import { GuestBase } from '../components/GuestBase'
import { ImportMasterKey } from '../components/Importer/ImportMasterkey'
import { Link } from 'react-router-dom'

export function AccountImport(): JSX.Element {
    return (
        <GuestBase
            sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: 2
            }}
            additionalButton={
                <Button component={Link} to="/register">
                    はじめる
                </Button>
            }
        >
            <ImportMasterKey />
        </GuestBase>
    )
}
