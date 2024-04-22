import { Box, Button, ButtonGroup, Checkbox, Menu, MenuItem, useTheme } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalActions } from '../context/GlobalActions'
import { useClient } from '../context/ClientContext'

export interface WatchButtonProps {
    color?: string
    userCCID: string
    userStreamID: string
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

    const watching = actions.allKnownTimelines.find((e) => e.id === props.userStreamID) !== undefined

    return (
        <Box>
            <ButtonGroup color="primary" variant="contained">
                <Button
                    onClick={(e) => {
                        if (watching) {
                            setMenuAnchor(e.currentTarget)
                        } else {
                            client.api
                                .subscribe(props.userStreamID, Object.keys(actions.listedSubscriptions)[0])
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
                        {key}
                        <Checkbox
                            checked={
                                actions.listedSubscriptions[key].items.find((e) => e.id === props.userStreamID) !==
                                undefined
                            }
                            onChange={(check) => {
                                if (check.target.checked) {
                                    client.api.subscribe(props.userStreamID, key).then((subscription) => {
                                        console.log(subscription)
                                    })
                                } else {
                                    client.api.unsubscribe(props.userStreamID, key).then((subscription) => {
                                        console.log(subscription)
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
