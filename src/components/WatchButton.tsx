import { Box, Button, ButtonGroup, Checkbox, IconButton, Menu, MenuItem, Tooltip, useTheme } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalActions } from '../context/GlobalActions'
import { useClient } from '../context/ClientContext'

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

export interface WatchButtonProps {
    timelineID: string
    minimal?: boolean
}

export const WatchButton = (props: WatchButtonProps): JSX.Element => {
    const theme = useTheme()
    const { client } = useClient()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    const [isHovered, setIsHovered] = useState(false)
    const actions = useGlobalActions()

    if (!actions) {
        return <></>
    }

    const { t } = useTranslation('', { keyPrefix: 'common' })

    const watching = actions.allKnownTimelines.find((e) => e.id === props.timelineID) !== undefined

    return (
        <Box>
            {props.minimal ? (
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
            ) : (
                <ButtonGroup color="primary" variant="contained">
                    <Button
                        onClick={(e) => {
                            if (watching) {
                                setMenuAnchor(e.currentTarget)
                            } else {
                                client.api
                                    .subscribe(props.timelineID, Object.keys(actions.listedSubscriptions)[0])
                                    .then((subscription) => {
                                        console.log(subscription)
                                    })
                            }
                        }}
                        onMouseEnter={() => {
                            setIsHovered(true)
                        }}
                        onMouseLeave={() => {
                            setIsHovered(false)
                        }}
                    >
                        {watching ? (isHovered ? t('unwatch') : t('watching')) : t('watch')}
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
            )}

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
                {Object.keys(actions.listedSubscriptions).map((key) => (
                    <MenuItem key={key} onClick={() => {}}>
                        {actions.listedSubscriptions[key].document.body.name}
                        <Checkbox
                            checked={
                                actions.listedSubscriptions[key].items.find((e) => e.id === props.timelineID) !==
                                undefined
                            }
                            onChange={(check) => {
                                if (check.target.checked) {
                                    client.api.subscribe(props.timelineID, key).then((_) => {
                                        actions.reloadList()
                                    })
                                } else {
                                    client.api.unsubscribe(props.timelineID, key).then((_) => {
                                        actions.reloadList()
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
