import { Divider, Tab, Tabs, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { RepositoryExportButton, RepositoryImportButton, V0RepositoryImportButton } from '../RepositoryManageButtons'
import { useState } from 'react'
import { Migrator } from '../Migrator'

export function ImportExport(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'settings.importexport' })
    // const [tab, setTab] = useState('manage')
    const [tab, setTab] = useState('migrate')

    return (
        <>
            <Tabs
                value={tab}
                onChange={(_, v) => {
                    setTab(v)
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
                </>
            )}

            {tab === 'migrate' && (
                <>
                    <Migrator />
                </>
            )}
        </>
    )
}
