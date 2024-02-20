import { Button, Divider, Paper } from '@mui/material'
import { GuestBase } from '../components/GuestBase'
import { ImportMasterKey } from '../components/Importer/ImportMasterkey'
import { Link } from 'react-router-dom'
import { ImportSubkey } from '../components/Importer/ImportSubkey'

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
            <Paper
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '20px',
                    flex: 1,
                    gap: '20px'
                }}
            >
                <ImportSubkey />
                <Divider>または</Divider>
                <ImportMasterKey />
            </Paper>
        </GuestBase>
    )
}
