import { IconButton, Zoom, useTheme } from '@mui/material'
import { useSnackbar } from 'notistack'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { usePreference } from '../context/PreferenceContext'

export interface FollowButtonProps {
    userCCID: string
}

export const FollowButton = (props: FollowButtonProps): JSX.Element => {
    const theme = useTheme()
    const pref = usePreference()
    const { enqueueSnackbar } = useSnackbar()
    const following = props.userCCID && pref.followingUsers.includes(props.userCCID)

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen
    }

    return (
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
    )
}
