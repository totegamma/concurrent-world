import { Box } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { type CoreProfile, type Client, type ProfileSchema } from '@concurrent-world/client'
import { StorageProvider } from '../../context/StorageContext'
import { useTranslation } from 'react-i18next'

interface CreateProfileProps {
    next: () => void
    setProfile: (profile: CoreProfile<ProfileSchema>) => void
    client: Client | undefined
}

export function CreateProfile(props: CreateProfileProps): JSX.Element {
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
                        onSubmit={(updated) => {
                            if (updated) props.setProfile(updated)
                            props.next()
                        }}
                    />
                </Box>
            </Box>
        </StorageProvider>
    )
}
