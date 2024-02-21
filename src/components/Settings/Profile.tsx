import { Box, Typography } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { useApi } from '../../context/api'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

export const ProfileSettings = (): JSX.Element => {
    const client = useApi()
    const { enqueueSnackbar } = useSnackbar()

    const { t } = useTranslation('', { keyPrefix: 'settings.profile' })

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}
        >
            <Box>
                <Typography variant="h3">{t('title')}</Typography>
                <Box
                    sx={{
                        width: '100%',
                        borderRadius: 1,
                        overflow: 'hidden',
                        mb: 1
                    }}
                >
                    <ProfileEditor
                        id={client?.user?.profile?.id}
                        initial={client?.user?.profile?.payload.body}
                        onSubmit={(_profile) => {
                            enqueueSnackbar(t('updated'), { variant: 'success' })
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )
}
