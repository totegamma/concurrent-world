import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

export interface BadgeListProps {
    address: string
}

export const BadgeList = (props: BadgeListProps): JSX.Element => {
    const endpoint = 'https://concord-testseed.concrnt.net'
    const badgesAPI = `${endpoint}/concrnt/concord/badge/badges`
    const [badges, setBadges] = useState<any>(null)
    const [templates, setTemplates] = useState<any>(null)

    useEffect(() => {
        if (!props.address) return
        fetch(badgesAPI + '/' + props.address, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setBadges(data.nfts)
                const classmap = new Map<string, any>()
                for (const cls of data.classes) {
                    classmap.set(cls.id, cls)
                }
                setTemplates(classmap)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [props.address])

    return (
        <Box>
            <Typography variant="h5">Badges</Typography>
            {badges?.map((b: any) => (
                <Box
                    key={b.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    <img src={templates?.get(b.class_id)?.uri} width="50px" alt={b.id} />
                    <Typography>{templates?.get(b.class_id)?.name}</Typography>
                    <Typography>{templates?.get(b.class_id)?.description}</Typography>
                    <Typography>{templates?.get(b.class_id)?.data?.creator}</Typography>
                </Box>
            ))}
        </Box>
    )
}
