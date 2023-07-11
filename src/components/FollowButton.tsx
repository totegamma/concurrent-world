import { Box, IconButton, Zoom, useTheme } from '@mui/material'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApi } from '../context/api'
import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'
import { useSnackbar } from 'notistack'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { usePreference } from '../context/PreferenceContext'

export interface FollowButtonProps {
    userCCID: string
}

export const FollowButton = (props: FollowButtonProps): JSX.Element => {
    const api = useApi()
    const theme = useTheme()
    const pref = usePreference()
    const { enqueueSnackbar } = useSnackbar()
    const [mode, setMode] = useState<'info' | 'edit'>('info')
    const self = props.userCCID === api.userAddress
    const following = props.userCCID && pref.followingUsers.includes(props.userCCID)

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '40px',
                height: '40px',
                mr: '8px'
            }}
        >
            {self ? (
                <>
                    <Zoom
                        in={mode === 'info'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${mode === 'info' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                setMode('edit')
                            }}
                        >
                            <CreateIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    <Zoom
                        in={mode === 'edit'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${mode === 'edit' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                setMode('info')
                            }}
                        >
                            <InfoIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    {mode === 'edit' && <Navigate to="/settings" />}
                </>
            ) : (
                <>
                    <Zoom
                        in={following || false}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${following ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            onClick={() => {
                                props.userCCID && pref.unfollowUser(props.userCCID)
                                enqueueSnackbar('Unfollowed', { variant: 'success' })
                            }}
                        >
                            <PersonRemoveIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    <Zoom
                        in={!following}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${following ? 0 : transitionDuration.exit}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            onClick={() => {
                                props.userCCID && pref.followUser(props.userCCID)
                                enqueueSnackbar('Followed', { variant: 'success' })
                            }}
                        >
                            <PersonAddAlt1Icon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                </>
            )}
        </Box>
    )
}
