import { Checkbox, IconButton, Menu, MenuItem } from '@mui/material'
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
        <>
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
                {Object.keys(pref.lists).map((e) => (
                    <MenuItem key={e} onClick={() => {}}>
                        {pref.lists[e].label}
                        <Checkbox
                            checked={pref.lists[e].items.map((e) => e.id).includes(props.userStreamID)}
                            onChange={(check) => {
                                const old = pref.lists
                                if (check.target.checked) {
                                    old[e].items.push({
                                        type: 'user',
                                        id: props.userStreamID,
                                        userID: props.userCCID
                                    })
                                    pref.setLists(old)
                                } else {
                                    old[e].items = old[e].items.filter((e) => e.id !== props.userStreamID)
                                    pref.setLists(old)
                                }
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
