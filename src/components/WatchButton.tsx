import { Box, Button, ButtonGroup, Checkbox, Menu, MenuItem, useTheme } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { usePreference } from '../context/PreferenceContext'
import { useState } from 'react'
import { type StreamList } from '../model'
import { useTranslation } from 'react-i18next'

export interface WatchButtonProps {
    color?: string
    userCCID: string
    userStreamID: string
}

export const WatchButton = (props: WatchButtonProps): JSX.Element => {
    const [lists, setLists] = usePreference('lists')
    const theme = useTheme()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    const [isHovered, setIsHovered] = useState(false)

    const { t } = useTranslation('', { keyPrefix: 'common' })

    const watching = lists ? lists.home.userStreams.map((e) => e.userID).includes(props.userCCID) : []

    if (lists === undefined) {
        return <></>
    }

    const updateList = (id: string, list: StreamList): void => {
        const old = lists
        old[id] = list
        setLists(JSON.parse(JSON.stringify(old)))
    }

    return (
        <Box>
            <ButtonGroup color="primary" variant="contained">
                <Button
                    onClick={(_) => {
                        if (watching) {
                            updateList('home', {
                                ...lists.home,
                                userStreams: lists.home.userStreams.filter((e) => e.userID !== props.userCCID)
                            })
                        } else {
                            updateList('home', {
                                ...lists.home,
                                userStreams: [
                                    ...lists.home.userStreams,
                                    {
                                        streamID: props.userStreamID,
                                        userID: props.userCCID
                                    }
                                ]
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
                {Object.keys(lists).map((id) => (
                    <MenuItem key={id} onClick={() => {}}>
                        {lists[id].label}
                        <Checkbox
                            checked={lists[id].userStreams.map((e) => e.userID).includes(props.userCCID)}
                            onChange={(check) => {
                                if (check.target.checked) {
                                    updateList(id, {
                                        ...lists[id],
                                        userStreams: [
                                            ...lists[id].userStreams,
                                            {
                                                streamID: props.userStreamID,
                                                userID: props.userCCID
                                            }
                                        ]
                                    })
                                } else {
                                    updateList(id, {
                                        ...lists[id],
                                        userStreams: lists[id].userStreams.filter((e) => e.userID !== props.userCCID)
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
