import { Box, Button, ButtonGroup, Checkbox, Menu, MenuItem, useTheme } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { usePreference } from '../context/PreferenceContext'
import { useState } from 'react'

export interface FollowButtonProps {
    color?: string
    userCCID: string
    userStreamID: string
}

export const FollowButton = (props: FollowButtonProps): JSX.Element => {
    const pref = usePreference()
    const theme = useTheme()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    const followed =
        pref?.lists !== undefined && pref.lists.home.userStreams.map((e) => e.userID).includes(props.userCCID)

    if (pref?.lists === undefined) {
        return <></>
    }

    return (
        <Box>
            <ButtonGroup variant="contained" color="primary">
                <Button
                    onClick={(_) => {
                        if (followed) {
                            pref.updateList('home', {
                                ...pref.lists.home,
                                userStreams: pref.lists.home.userStreams.filter((e) => e.userID !== props.userCCID)
                            })
                        } else {
                            pref.updateList('home', {
                                ...pref.lists.home,
                                userStreams: [
                                    ...pref.lists.home.userStreams,
                                    {
                                        streamID: props.userStreamID,
                                        userID: props.userCCID
                                    }
                                ]
                            })
                        }
                    }}
                >
                    {followed ? 'Unfollow' : 'Follow'}
                </Button>
                <Button
                    size="small"
                    onClick={(e) => {
                        setMenuAnchor(e.currentTarget)
                    }}
                    sx={{
                        padding: 0
                    }}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
                sx={{
                    zIndex: theme.zIndex.tooltip + 1
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
