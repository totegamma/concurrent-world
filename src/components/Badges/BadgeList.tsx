import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { CCUserChip } from '../ui/CCUserChip'

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
            <Typography variant="h2">Badges</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Visual</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>CreatedBy</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {badges?.map((b: any) => (
                        <TableRow key={b.id}>
                            <TableCell>
                                <img src={templates?.get(b.class_id)?.uri} width="50px" alt={b.id} />
                            </TableCell>
                            <TableCell>{templates?.get(b.class_id)?.name}</TableCell>
                            <TableCell>{templates?.get(b.class_id)?.description}</TableCell>
                            <TableCell>
                                <CCUserChip avatar ccid={templates?.get(b.class_id)?.data?.creator} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    )
}
