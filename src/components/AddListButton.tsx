import { Checkbox, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { useState } from 'react'
import { usePreference } from '../context/PreferenceContext'

export interface AddListButtonProps {
    stream: string
}

export const AddListButton = (props: AddListButtonProps): JSX.Element => {
    const pref = usePreference()

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    if (!pref?.lists) return <></>

    return (
        <>
            <Tooltip title="リストに追加" placement="top" arrow>
                <IconButton
                    sx={{ flexGrow: 0 }}
                    onClick={(e) => {
                        setMenuAnchor(e.currentTarget)
                    }}
                >
                    <PlaylistAddIcon
                        sx={{
                            color: 'text.primary'
                        }}
                    />
                </IconButton>
            </Tooltip>
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
                            checked={pref.lists[e].streams.includes(props.stream)}
                            onChange={(check) => {
                                const old = pref.lists
                                if (check.target.checked) {
                                    old[e].streams.push(props.stream)
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                } else {
                                    old[e].streams = old[e].streams.filter((e) => e !== props.stream)
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                }
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
