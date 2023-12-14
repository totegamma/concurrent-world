import { Box, Button, Divider, Paper, Typography } from '@mui/material'
import { CCAvatar } from '../ui/CCAvatar'
import { type Identity } from '../../util'
import { useTranslation } from 'react-i18next'

export function YourID(props: { next: () => void; identity: Identity }): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'registration.yourID' })
    return (
        <Box
            sx={{
                width: '100%'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        padding: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <CCAvatar identiconSource={props.identity.CCID} />
                    <Typography
                        sx={{
                            fontSize: {
                                xs: '0.9rem',
                                sm: '1rem'
                            }
                        }}
                    >
                        {props.identity.CCID}
                    </Typography>
                </Paper>
                <Typography>{t('desc1')}</Typography>
                <Typography>{t('desc2')}</Typography>
                <Typography>{t('desc3')}</Typography>
                <Button
                    onClick={(): void => {
                        props.next()
                    }}
                >
                    {t('next')}
                </Button>
            </Box>
        </Box>
    )
}
