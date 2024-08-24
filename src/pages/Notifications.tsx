import { Box, Chip, Divider, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useClient } from '../context/ClientContext'
import { QueryTimelineReader } from '../components/QueryTimeline'
import { useMemo, useState } from 'react'
import { Schemas } from '@concurrent-world/client'

export function Notifications(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.notifications' })
    const { client } = useClient()

    const timeline = client.user?.notificationTimeline

    const [selected, setSelected] = useState<string | undefined>(undefined)

    const query = useMemo(() => {
        return selected ? { schema: selected } : {}
    }, [selected])

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    paddingX: 1,
                    paddingTop: 1
                }}
            >
                <Typography variant="h2">{t('title')}</Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        py: 1
                    }}
                >
                    <Chip
                        label={'リプライ'}
                        onClick={() => {
                            setSelected(selected === Schemas.replyAssociation ? undefined : Schemas.replyAssociation)
                        }}
                        color="primary"
                        variant={selected === Schemas.replyAssociation ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={'メンション'}
                        onClick={() => {
                            setSelected(
                                selected === Schemas.mentionAssociation ? undefined : Schemas.mentionAssociation
                            )
                        }}
                        color="primary"
                        variant={selected === Schemas.mentionAssociation ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={'リルート'}
                        onClick={() => {
                            setSelected(
                                selected === Schemas.rerouteAssociation ? undefined : Schemas.rerouteAssociation
                            )
                        }}
                        color="primary"
                        variant={selected === Schemas.rerouteAssociation ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={'お気に入り'}
                        onClick={() => {
                            setSelected(selected === Schemas.likeAssociation ? undefined : Schemas.likeAssociation)
                        }}
                        color="primary"
                        variant={selected === Schemas.likeAssociation ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={'リアクション'}
                        onClick={() => {
                            setSelected(
                                selected === Schemas.reactionAssociation ? undefined : Schemas.reactionAssociation
                            )
                        }}
                        color="primary"
                        variant={selected === Schemas.reactionAssociation ? 'filled' : 'outlined'}
                    />
                </Box>
                <Divider />
            </Box>
            {timeline && <QueryTimelineReader timeline={timeline} query={query} />}
        </Box>
    )
}
