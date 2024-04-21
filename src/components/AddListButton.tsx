import { Checkbox, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { useState } from 'react'
import { useClient } from '../context/ClientContext'
import { useGlobalActions } from '../context/GlobalActions'

export interface AddListButtonProps {
    stream: string
}

export const AddListButton = (props: AddListButtonProps): JSX.Element => {
    const { client } = useClient()
    const actions = useGlobalActions()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    if (!actions) {
        return <></>
    }

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
                {Object.keys(actions.listedSubscriptions).map((key) => (
                    <MenuItem key={key} onClick={() => {}}>
                        {key}
                        <Checkbox
                            checked={
                                actions.listedSubscriptions[key].items.find((e) => e.id === props.stream) !== undefined
                            }
                            onChange={(check) => {
                                if (check.target.checked) {
                                    client.api.subscribe(props.stream, key).then((subscription) => {
                                        console.log(subscription)
                                    })
                                } else {
                                    client.api.unsubscribe(props.stream, key).then((subscription) => {
                                        console.log(subscription)
                                    })
                                }
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
