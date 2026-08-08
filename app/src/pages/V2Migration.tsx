import { Box, Divider, Typography } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { CfmRenderer } from '../components/ui/CfmRenderer'
import { useClient } from '../context/ClientContext'
import AppStoreQR from '../components/welcome/AppStoreQR'

export function V2Migration(): JSX.Element {
    const { client } = useClient()

    return (
        <>
            <Helmet>
                <title>V2移行について - Concrnt</title>
            </Helmet>
            <Box
                sx={{
                    width: '100%',
                    minHeight: '100%',
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto'
                }}
            >
                <Box
                    sx={{
                        paddingX: 1,
                        paddingTop: 1
                    }}
                >
                    <Typography variant="h2">V2移行について</Typography>
                    <Divider />
                    <Box
                        sx={{
                            padding: { xs: 2, sm: 4, md: 4 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <CfmRenderer
                            messagebody={`
Concrntはこの度大きなアップデートとして、通称V2移行と呼ばれるアップデートを行います。
いままでもConcrntは細やかなアップデートをたびたび行ってきましたが、今回のアップデートはそれらに比べると大きな変更となるため、今回は平行運用期間を設けています。

ariakeサーバーでは、このスケジュールにてV2移行を行います。

![MigrationSchedule](https://worldfile.cc/con1t0tey8uxhkqkd4wcp4hd4jedt7f0vfhk29xdd2/355d1255-e99c-4f86-8727-581054b51636.png)

平行運用期間中はv1環境とv2環境の両方の利用が可能ですが、これはv2に移行するための期間ですので、できるだけv2環境をご利用いただけますようお願いいたします。
運用期間中、v1の投稿は定期的にv2環境へ転送されますが、v2環境の投稿はv1環境からは閲覧できません。

また、8/8にActivityPub連携の切り替えを実施しました。現在はv2環境での投稿がActivityPub環境に転送されており、v1環境での投稿はActivityPub環境には転送されません。

投稿当のデータはv2環境に自動的に移行されているため、v2環境にてマスターキーを使ってログインすることで、そのままご利用いただけます。

当クライアントサイト https://concrnt.world は、平行運用終了期間の8/23までv1環境へのクライアントとして提供されますが、8/23以降はv2環境へのクライアントとして提供されるようになります。

## V2環境へのアクセス方法

V2環境へのアクセスは、専用アプリの利用がおすすめです。
`}
                            emojiDict={{}}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <AppStoreQR
                                title="V2環境へは専用アプリで"
                                description="お使いのスマートフォンで下のQRコードを読み取るか、バッジをタップしてアプリを入手し、マスターキーでログインしてください。"
                            />
                        </Box>
                        <CfmRenderer
                            messagebody={`
また、web版は所属しているサーバーのURL https://${client.server?.fqdn} から利用することもできます。
web版を利用する場合は、web版に直接マスターキーを利用してログインするのではなく、アプリを利用してログインするのがおすすめです。

## 対応が必要なこと
投稿等は全て移行されていますが、テーマや絵文字などは自動で移行されません。
各設定画面にて設定をコピーし、v2のアプリ/web版にて読み込ませることで、v2環境でも同じ設定を利用することができます。

## マスターキーを紛失した場合
マスターキーを紛失した場合、同じccidでログインすることができないため、v2環境にログインすることができません。
新しくアカウントを作成する必要があります。

その際、v1環境の投稿は自動で引き継がれないため、手動で投稿などのデータを移行する必要があります。
concrnt.worldのデータ管理よりバックアップデータをエクスポートし、v2環境の「v1からのインポート」を利用することで、投稿などのデータを移行することができます。

マスターキーはconcrntにて自分のアカウントの所有権を証明するための重要な情報です。紛失した場合サーバー管理者であってもこれを救済することはできません。マスターキーは大切に保管してください。

## サーバー運用者の方へ

concrntのサーバーを運用されているかたは、サーバーをv2環境へ移行する必要があります。
詳しくは移行ガイド https://square.concrnt.net/operator/migration/ をご覧ください。


`}
                            emojiDict={{}}
                        />
                    </Box>
                </Box>
            </Box>
        </>
    )
}
