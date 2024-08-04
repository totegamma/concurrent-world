import { type SigningStargateClient, type StdFee } from '@cosmjs/stargate'
import { Box, Button, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

export interface BadgeManageProps {
    address: string
    cosmJS: SigningStargateClient
    onDone?: (hash: string) => void
}

export const BadgeManage = (props: BadgeManageProps): JSX.Element => {
    const endpoint = 'https://concord-testseed.concrnt.net'
    const [processing, setProcessing] = useState<boolean>(false)

    const [classes, setClasses] = useState<any>([])

    const createBadgeTemplate = async (): Promise<void> => {
        const sendMsg = {
            typeUrl: '/concord.badge.MsgCreateTemplate',
            value: {
                name: 'My Badge',
                creator: props.address,
                description: 'My Badge Description',
                uri: 'https://example.com',
                transferable: true
            }
        }

        const defaultSendFee: StdFee = {
            amount: [
                {
                    denom: 'uAmpere',
                    amount: '500'
                }
            ],
            gas: '100000'
        }

        setProcessing(true)
        const signResult = await props.cosmJS
            .signAndBroadcast(props.address, [sendMsg], defaultSendFee, 'mymsg')
            .finally(() => {
                setProcessing(false)
            })

        props.onDone?.(signResult?.transactionHash)
    }

    return (
        <Box>
            <Typography variant="h5">Manage</Typography>
            <Button
                disabled={processing}
                onClick={() => {
                    createBadgeTemplate()
                }}
            >
                Create Badge Template
            </Button>
        </Box>
    )
}
