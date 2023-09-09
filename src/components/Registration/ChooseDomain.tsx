import { IssueJWT } from "@concurrent-world/client"
import { Alert, AlertTitle, Avatar, Box, Button, Divider, Link, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { Link as RouterLink } from 'react-router-dom'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export function ChooseDomain(props: {next: ()=>void}): JSX.Element {

    const [entityFound, setEntityFound] = useState<boolean>(false)

    const checkRegistration = async (): Promise<void> => {
        console.log('check!!!')
        client?.api.invalidateEntity(CCID)
        const entity = await client?.api.readEntity(CCID)
        console.log(entity)
        setEntityFound(!!entity && entity.ccid != null)
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
                        component={RouterLink}
                        to={`https://hub.concurrent.world/web/register?token=${
                            IssueJWT(privateKey, { iss: CCID, aud: 'hub.concurrent.world' }) ?? ''
                        }`}
                        target="_blank"
                        onClick={() => {
                            setServer('hub.concurrent.world')
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
                        component={RouterLink}
                        to={
                            'http://' +
                            (host?.fqdn ?? '') +
                            '/web/register?token=' +
                            (IssueJWT(privateKey, { iss: CCID, aud: host?.fqdn }) ?? '')
                        }
                        target="_blank"
                        disabled={!host}
                    >
                        登録ページへ
                    </Button>
                </Box>
            </Box>
            <Button
                variant="contained"
                disabled={!host}
                onClick={() => {
                    checkRegistration()
                }}
            >
                ドメインの登録状況を確認
            </Button>
            <Button
                variant="contained"
                disabled={!entityFound}
                onClick={(): void => {
                    props.next()
                }}
            >
                Next: プロフィールの作成
            </Button>
        </Box>
    )
}

