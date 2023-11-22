import { type Client, type CoreDomain, IssueJWT } from '@concurrent-world/client'
import {
    Alert,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Divider,
    Link,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { type Identity } from '../../util'

interface ChooseDomainProps {
    next: () => void
    identity: Identity
    client: Client | undefined
    host: CoreDomain | null | undefined
    setHost: (_: CoreDomain | null | undefined) => void
}

export function ChooseDomain(props: ChooseDomainProps): JSX.Element {
    const [server, setServer] = useState<string>('')
    const [jumped, setJumped] = useState<boolean>(false)

    useEffect(() => {
        let unmounted = false
        if (!props.client) return
        const fqdn = server.replace('https://', '').replace('/', '')
        props.client.api.readDomain(fqdn).then((e) => {
            if (unmounted) return
            props.setHost(e)
        })
        console.log(fqdn)
        return () => {
            unmounted = true
        }
    }, [server])

    const jumpToDomain = (fqdn: string): void => {
        let next = window.location.href
        // strip hash
        const hashIndex = next.indexOf('#')
        if (hashIndex !== -1) {
            next = next.substring(0, hashIndex)
        }
        // add next hash
        next = `${next}#5`

        const token = IssueJWT(props.identity.privateKey, { iss: props.identity.CCID, aud: fqdn }) ?? ''
        const link = `http://${fqdn}/web/register?token=${token}&callback=${encodeURIComponent(next)}`

        // window.location.href = link // TODO: ドメイン側のアップデートが行われるまで新規タブで開く
        window.open(link, '_blank')
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}
        >
            <Typography>
                あなたのメッセージを保存・配信してくれるドメインを探しましょう。
                <br />
                どのドメインを選択しても、だれとでもつながる事ができます。
                <br />
                また、(鯖管が頑張れば)いつでも別のドメインに移行する事ができます。
            </Typography>
            <Alert severity="info">
                <AlertTitle>ここで一度concurrent.worldからドメイン管轄サイトへ移動します</AlertTitle>
                ドメインでのアカウント作成後、またこのページに戻ってくる必要があります。このタブを閉じないでください。
            </Alert>
            <Box width="100%" display="flex" flexDirection="column">
                <Typography variant="h3">リストから選択</Typography>
                <List>
                    <ListItemButton
                        onClick={() => {
                            setJumped(true)
                            setServer('hub.concurrent.world')
                            jumpToDomain('hub.concurrent.world')
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar></Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="hub.concurrent.world" />
                        <ListItemIcon>
                            <OpenInNewIcon />
                        </ListItemIcon>
                    </ListItemButton>
                </List>
                <Divider>または</Divider>
                <Typography variant="h3">URLから直接入力</Typography>
                <Typography
                    color="text.primary"
                    component={Link}
                    variant="caption"
                    href="https://github.com/totegamma/concurrent"
                    target="_blank"
                >
                    Tips: 自分でサーバーを建てる場合はこちら
                </Typography>
                <Box flex="1" />
                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <TextField
                        placeholder="concurrent.example.tld"
                        value={server}
                        onChange={(e) => {
                            setServer(e.target.value)
                        }}
                        sx={{
                            flex: 1
                        }}
                    />
                    <Button
                        variant="contained"
                        disabled={!props.host}
                        onClick={() => {
                            setJumped(true)
                            jumpToDomain(server)
                        }}
                    >
                        登録ページへ
                    </Button>
                </Box>
            </Box>
            <Button
                variant="contained"
                disabled={!jumped}
                onClick={(): void => {
                    props.client?.api.invalidateEntity(props.identity.CCID)
                    props.client?.api
                        .readEntity(props.identity.CCID)
                        .then((e) => {
                            if (e?.ccid != null) {
                                props.next()
                            } else {
                                alert('ドメインでの登録が確認できません。ジャンプ先のドメインで登録を行ってください。')
                            }
                        })
                        .catch(() => {
                            alert('ドメインでの登録が確認できません。ジャンプ先のドメインで登録を行ってください。')
                        })
                }}
            >
                {jumped ? 'Next: プロフィールの作成' : 'ドメインでの登録が完了したら次に進めます'}
            </Button>
        </Box>
    )
}
