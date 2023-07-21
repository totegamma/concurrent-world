import { IconButton, List, ListItem, Typography } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'
import { v4 as uuidv4 } from 'uuid'
import { StreamListItem } from './StreamListItem'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'

export const StreamList = (): JSX.Element => {
    const pref = usePreference()
    return (
        <List>
            <ListItem
                onClick={() => {}}
                secondaryAction={
                    <IconButton
                        sx={{
                            p: 0,
                            color: 'background.contrastText'
                        }}
                        onClick={() => {
                            const old = pref.lists
                            old[uuidv4()] = {
                                label: 'new list',
                                pinned: false,
                                expanded: false,
                                streams: [],
                                userStreams: [],
                                defaultPostStreams: []
                            }
                            pref.setLists(JSON.parse(JSON.stringify(old)))
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                }
                sx={{
                    gap: '8px'
                }}
            >
                <ListIcon
                    sx={{
                        color: 'background.contrastText'
                    }}
                />
                <Typography flex={1} fontSize={'0.875rem'} justifyContent={'center'} marginY={'3px'}>
                    Lists
                </Typography>
            </ListItem>
            {Object.keys(pref.lists).map((key) => (
                <StreamListItem key={key} id={key} body={pref.lists[key]} />
            ))}
        </List>
    )
}
