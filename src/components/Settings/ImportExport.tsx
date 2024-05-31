import { Box, Button, Dialog, Divider, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { RepositoryExportButton, RepositoryImportButton, V0RepositoryImportButton } from '../RepositoryManageButtons'
import { useState } from 'react'
import { Migrator } from '../Migrator'
import { usePreference } from '../../context/PreferenceContext'
import { useParams, useNavigate } from 'react-router-dom'

export function ImportExport(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'settings.importexport' })
    const [customThemes, setCustomTheme] = usePreference('customThemes')
    const [importTheme, setImportTheme] = useState('')
    const { tab } = useParams()
    const navigate = useNavigate()

    const [openThemeImportDialog, setOpenThemeImportDialog] = useState(false)

    return (
        <>
            <Tabs
                value={tab}
                onChange={(_, v) => {
                    navigate(`/settings/importexport/${v}`)
                }}
            >
                <Tab value={'manage'} label={'データ管理'} />
                <Tab value={'migrate'} label={'引っ越し'} />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {tab === 'manage' && (
                <>
                    <Typography variant="h3">{t('export')}</Typography>
                    <RepositoryExportButton />

                    <Divider
                        sx={{
                            marginY: 2
                        }}
                    />

                    <Typography variant="h3">{t('import')}</Typography>
                    <RepositoryImportButton />

                    <Divider
                        sx={{
                            marginY: 2
                        }}
                    />

                    <Typography variant="h3">その他</Typography>
                    <V0RepositoryImportButton />

                    <Button
                        fullWidth
                        onClick={() => {
                            setOpenThemeImportDialog(true)
                        }}
                        variant="contained"
                        sx={{ mt: 2 }}
                    >
                        カスタムテーマのインポート
                    </Button>
                    <Dialog
                        open={openThemeImportDialog}
                        onClose={() => {
                            setOpenThemeImportDialog(false)
                        }}
                    >
                        <Box padding={2} display="flex" flexDirection="column">
                            <Typography variant="h3" sx={{ margin: 2 }}>
                                カスタムテーマのインポート
                            </Typography>
                            <TextField
                                sx={{ margin: 2 }}
                                rows={5}
                                multiline
                                label="JSON"
                                value={importTheme}
                                onChange={(e) => {
                                    setImportTheme(e.target.value)
                                }}
                            />
                            <Button
                                onClick={() => {
                                    const newThemes = JSON.parse(importTheme)
                                    for (const key in newThemes) {
                                        if (key in customThemes) continue
                                        customThemes[key] = newThemes[key]
                                    }
                                    setCustomTheme(customThemes)
                                    setOpenThemeImportDialog(false)
                                }}
                                variant="contained"
                                sx={{ margin: 2 }}
                            >
                                インポート
                            </Button>
                        </Box>
                    </Dialog>
                </>
            )}

            {tab === 'migrate' && <Migrator />}
        </>
    )
}
