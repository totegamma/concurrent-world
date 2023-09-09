import { Box, Button, Grid, Paper, Typography } from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import { type Identity } from '../../util'

export function SecretCode(props: { next: () => void; identity: Identity }): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '15px',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Paper
                variant="outlined"
                component={Grid}
                style={{
                    width: '100%',
                    margin: 1
                }}
                spacing={1}
                columns={4}
                container
            >
                {props.identity.mnemonic.split('　').map((e, i) => (
                    <Grid
                        key={i}
                        item
                        xs={2}
                        sm={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            padding: '5px'
                        }}
                    >
                        {i + 1}:
                        <Paper
                            variant="outlined"
                            sx={{ display: 'inline-block', padding: '5px', width: '100%', textAlign: 'center' }}
                        >
                            {e}
                        </Paper>
                    </Grid>
                ))}
            </Paper>
            <Button
                variant="contained"
                onClick={() => {
                    navigator.clipboard.writeText(props.identity.mnemonic)
                }}
                startIcon={<ContentPasteIcon />}
            >
                シークレットコードをコピー
            </Button>
            <Typography>
                シークレットコードは、あなたが再ログインしたいとき、別の端末からログインしたいときに必要な呪文です。
            </Typography>
            <Typography>
                <b>絶対に紛失しないように</b>そして、
                <b>絶対に誰にも知られないように</b>してください。
            </Typography>
            <Typography>
                紛失すると、二度とあなたのアカウントにアクセスできなくなります。
                また、他人に知られると、あなたのアカウントがハッカーとの共有アカウントになってしまいます。
            </Typography>
            <Typography>メモを取りましたか？</Typography>
            <Button
                variant="contained"
                onClick={(): void => {
                    props.next()
                }}
            >
                Next: シークレットコードの確認
            </Button>
        </Box>
    )
}
