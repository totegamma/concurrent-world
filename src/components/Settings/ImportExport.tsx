import { Divider, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { RepositoryExportButton, RepositoryImportButton, V0RepositoryImportButton } from '../RepositoryManageButtons'

export function ImportExport(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'settings.importexport' })

    return (
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
    )
}
