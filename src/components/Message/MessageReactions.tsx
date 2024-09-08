import { Box, Button, Divider, Tooltip, Typography, alpha, useTheme } from '@mui/material'
import { CCAvatar } from '../ui/CCAvatar'
import { CurrencyText } from '../ui/CurrencyText'
import { useEffect, useState } from 'react'
import { Link as routerLink } from 'react-router-dom'

import {
    type Association,
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type MarkdownMessageSchema
} from '@concurrent-world/client'
import { type EmojiAssociation } from '@concurrent-world/client/dist/types/schemas/emojiAssociation'
import { useClient } from '../../context/ClientContext'
import { type UpgradeAssociationSchema } from '@concurrent-world/client/dist/types/schemas/upgradeAssociation'
import { useConcord } from '../../context/ConcordContext'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { enqueueSnackbar } from 'notistack'

export interface MessageReactionsProps {
    message: Message<MarkdownMessageSchema | ReplyMessageSchema | RerouteMessageSchema>
}

interface SuperReaction {
    reaction: Association<EmojiAssociation>
    amount: string
    txhash: string
}

const superReactionColor = '#FFD700'
const superReactionColorText = '#000000'

export const MessageReactions = (props: MessageReactionsProps): JSX.Element => {
    const theme = useTheme()
    const concord = useConcord()
    const { client } = useClient()
    const [reactionMembers, setReactionMembers] = useState<Record<string, Array<Association<EmojiAssociation>>>>({})
    const [superReactions, setSuperReactions] = useState<SuperReaction[]>([])
    const upgradeCount = props.message?.associationCounts?.[Schemas.upgradeAssociation] ?? 0

    useEffect(() => {
        if (upgradeCount <= 0) return
        setSuperReactions([])
        client.api
            .getMessageAssociationsByTarget<UpgradeAssociationSchema>(props.message.id, props.message.author, {
                schema: Schemas.upgradeAssociation
            })
            .then((associations) => {
                for (const association of associations) {
                    const txhash = association.document.body.txhash
                    concord.getRawTx(txhash).then(async (tx) => {
                        if (!tx) return
                        const memo = tx.body.memo
                        if (!memo.startsWith('ccref:')) return
                        const ref = memo.split(':')[1]

                        const MsgSendMsg = tx.body.messages.find(
                            (msg) => msg.typeUrl === '/cosmos.bank.v1beta1.MsgSend'
                        )
                        if (!MsgSendMsg) return
                        const msg = MsgSend.decode(MsgSendMsg.value)
                        const tip = msg.amount.find((coin) => coin.denom === 'uAmpere')?.amount
                        if (!tip) return

                        const reaction = await client.getAssociation<EmojiAssociation>(ref, props.message.author)
                        if (!reaction || reaction.schema !== Schemas.reactionAssociation) return

                        setSuperReactions((prev) => {
                            return [
                                ...prev,
                                {
                                    reaction,
                                    amount: tip,
                                    txhash
                                }
                            ]
                        })
                    })
                }
            })
    }, [upgradeCount])

    const ownReactions = Object.fromEntries(
        props.message?.ownAssociations
            .filter((association) => association.schema === Schemas.reactionAssociation)
            .map((association) => [association.document.body.imageUrl, association])
    )

    const loadReactionMembers = (reaction: string): void => {
        props.message.getReactions(reaction).then((reactions) => {
            setReactionMembers((prev) => {
                return {
                    ...prev,
                    [reaction]: reactions
                }
            })
        })
    }

    const reactionCounts: Record<string, number> = (() => {
        if (!props.message.reactionCounts) return {}
        const tmp = JSON.parse(JSON.stringify(props.message.reactionCounts)) // deep copy
        for (const superReaction of superReactions) {
            if (tmp[superReaction.reaction.document.body.imageUrl]) {
                tmp[superReaction.reaction.document.body.imageUrl] -= 1
            }
            if (tmp[superReaction.reaction.document.body.imageUrl] <= 0) {
                delete tmp[superReaction.reaction.document.body.imageUrl]
            }
        }
        return tmp
    })()

    if (!props.message.reactionCounts || Object.keys(props.message.reactionCounts).length === 0) {
        return <></>
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            <Box display="flex" flexWrap="wrap" gap={1}>
                {superReactions.map((reaction, i) => (
                    <Tooltip
                        arrow
                        key={i}
                        title={
                            <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none'
                                    }}
                                    component={routerLink}
                                    to={'/' + reaction.reaction.author}
                                >
                                    <CCAvatar
                                        avatarURL={reaction.reaction.authorUser?.profile?.avatar}
                                        identiconSource={reaction.reaction.author}
                                        sx={{
                                            width: { xs: '12px', sm: '18px' },
                                            height: { xs: '12px', sm: '18px' }
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            color: '#fff'
                                        }}
                                    >
                                        {reaction.reaction.authorUser?.profile?.username || 'anonymous'}
                                    </Typography>
                                </Box>
                            </Box>
                        }
                        placement="top"
                    >
                        <Button
                            key={i}
                            sx={{
                                py: 0,
                                px: 1,
                                gap: 1,
                                display: 'flex',
                                backgroundColor: alpha(superReactionColor, 0.5),
                                borderColor: superReactionColor,
                                textTransform: 'none'
                            }}
                            variant="outlined"
                            onClick={() => {
                                concord.inspectTx(reaction.txhash)
                            }}
                        >
                            <Box component="img" height="20px" src={reaction.reaction.document.body.imageUrl} />
                            <Typography color={superReactionColorText}>
                                <CurrencyText value={parseInt(reaction.amount)} />
                            </Typography>
                        </Button>
                    </Tooltip>
                ))}
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
                {Object.entries(reactionCounts).map(([imageUrl, value]) => (
                    <Tooltip
                        arrow
                        key={imageUrl}
                        title={
                            <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box component="img" height="20px" src={imageUrl}></Box>
                                    {reactionMembers[imageUrl]?.[0].document.body.shortcode ?? 'Loading...'}
                                </Box>
                                <Divider flexItem></Divider>
                                {reactionMembers[imageUrl]?.map((reaction) => (
                                    <Box
                                        key={reaction.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            textDecoration: 'none'
                                        }}
                                        component={routerLink}
                                        to={reaction.document.body.profileOverride?.link ?? '/' + reaction.author}
                                        target={reaction.document.body.profileOverride?.link ? '_blank' : undefined}
                                        rel={
                                            reaction.document.body.profileOverride?.link
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                    >
                                        <CCAvatar
                                            avatarURL={
                                                reaction.document.body.profileOverride?.avatar ??
                                                reaction.authorUser?.profile?.avatar
                                            }
                                            identiconSource={reaction.author}
                                            sx={{
                                                width: { xs: '12px', sm: '18px' },
                                                height: { xs: '12px', sm: '18px' }
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: '0.8rem',
                                                color: '#fff'
                                            }}
                                        >
                                            {reaction.document.body.profileOverride?.username ||
                                                reaction.authorUser?.profile?.username ||
                                                'anonymous'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        }
                        placement="top"
                        onOpen={() => {
                            loadReactionMembers(imageUrl)
                        }}
                    >
                        <Button
                            sx={{
                                py: 0,
                                px: 1,
                                gap: 1,
                                display: 'flex',
                                backgroundColor: ownReactions[imageUrl]
                                    ? alpha(theme.palette.primary.main, 0.5)
                                    : 'transparent',
                                borderColor: theme.palette.primary.main
                            }}
                            variant="outlined"
                            onClick={() => {
                                if (ownReactions[imageUrl]) {
                                    props.message.deleteAssociation(ownReactions[imageUrl])
                                } else {
                                    if (reactionMembers[imageUrl]) {
                                        const shortcode = reactionMembers[imageUrl]?.[0].document.body.shortcode
                                        props.message.reaction(shortcode, imageUrl).catch(() => {
                                            enqueueSnackbar('通信に失敗しました', { variant: 'error' })
                                        })
                                    } else {
                                        props.message.getReactions(imageUrl).then((reactions) => {
                                            const shortcode = reactions[0].document.body.shortcode
                                            props.message.reaction(shortcode, imageUrl).catch(() => {
                                                enqueueSnackbar('通信に失敗しました', { variant: 'error' })
                                            })
                                        })
                                    }
                                }
                            }}
                        >
                            <Box component="img" height="20px" src={imageUrl} />
                            <Typography color={ownReactions[imageUrl] ? 'primary.contrastText' : 'text.primary'}>
                                {value}
                            </Typography>
                        </Button>
                    </Tooltip>
                ))}
            </Box>
        </Box>
    )
}
