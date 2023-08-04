import { Box, Checkbox, IconButton, Menu, MenuItem } from '@mui/material'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import { usePreference } from '../context/PreferenceContext'
import { useState } from 'react'

export interface FollowButtonProps {
    color?: string
    userCCID: string
    userStreamID: string
}

export const FollowButton = (props: FollowButtonProps): JSX.Element => {
    const pref = usePreference()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    return (
        <Box>
            <IconButton
                onClick={(e) => {
                    setMenuAnchor(e.currentTarget)
                }}
            >
                <PersonAddAlt1Icon sx={{ color: props.color ?? 'primary.contrastText' }} />
            </IconButton>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                {Object.keys(pref.lists).map((id) => (
                    <MenuItem key={id} onClick={() => {}}>
                        {pref.lists[id].label}
                        <Checkbox
                            checked={pref.lists[id].userStreams.map((e) => e.userID).includes(props.userCCID)}
                            onChange={(check) => {
                                if (check.target.checked) {
                                    pref.updateList(id, {
                                        ...pref.lists[id],
                                        userStreams: [
                                            ...pref.lists[id].userStreams,
                                            {
                                                streamID: props.userStreamID,
                                                userID: props.userCCID
                                            }
                                        ]
                                    })
                                } else {
                                    pref.updateList(id, {
                                        ...pref.lists[id],
                                        userStreams: pref.lists[id].userStreams.filter(
                                            (e) => e.userID !== props.userCCID
                                        )
                                    })
                                }
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}
