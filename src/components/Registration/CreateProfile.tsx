import { Box } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { type Client } from '@concurrent-world/client'
import { StorageProvider } from '../../context/StorageContext'
import { useTranslation } from 'react-i18next'

export function CreateProfile(props: { next: () => void; client: Client | undefined }): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'registration.createProfile' })

    return (
        <StorageProvider>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                {t('desc')}
                <Box
                    sx={{
                        width: '100%',
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}
                >
                    <ProfileEditor
                        onSubmit={() => {
                            props.next()
                        }}
                    />
                </Box>
            </Box>
        </StorageProvider>
    )
}
