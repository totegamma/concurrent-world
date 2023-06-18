import { useState } from 'react'
import { Box, Button, Modal, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const LogoutButton = (): JSX.Element => {
    const [openLogoutModal, setOpenLogoutModal] = useState(false)
    const theme = useTheme()
    const navigate = useNavigate()

    const logout = (): void => {
        for (const key in localStorage) {
            localStorage.removeItem(key)
        }
    }

    return (
        <>
            <Modal
                open={openLogoutModal}
                onClose={() => {
                    setOpenLogoutModal(false)
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        transform: 'translate(-50%, -50%)',
                        flexDirection: 'column',
                        gap: '20px',
                        position: 'absolute',
                        padding: '20px',
                        borderRadius: '10px',
                        top: '50%',
                        left: '50%',
                        background: theme.palette.background.paper
                    }}
                >
                    <Typography component="h2" sx={{ color: theme.palette.text.primary }}>
                        Are you sure?
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                        秘密鍵のバックアップがないと、アカウントを復元できません。
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            logout()
                            setOpenLogoutModal(false)
                            navigate('/welcome')
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Modal>
            <Button
                color="error"
                variant="contained"
                onClick={(_) => {
                    setOpenLogoutModal(true)
                }}
            >
                Logout
            </Button>
        </>
    )
}
