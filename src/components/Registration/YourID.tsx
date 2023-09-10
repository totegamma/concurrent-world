import { Box, Button, Divider, Paper, Typography } from '@mui/material'
import { CCAvatar } from '../ui/CCAvatar'
import { type Identity } from '../../util'

export function YourID(props: { next: () => void; identity: Identity }): JSX.Element {
    return (
        <Box
            sx={{
                width: '100%'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        padding: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <CCAvatar identiconSource={props.identity.CCID} />
                    <Typography
                        sx={{
                            fontSize: {
                                xs: '0.9rem',
                                sm: '1rem'
                            }
                        }}
                    >
                        {props.identity.CCID}
                    </Typography>
                </Paper>
                <Typography>これは、Concurrentの世界であなたを特定する文字列です。</Typography>
                <Typography>
                    どのサーバーからもあなたを等しく識別できるよう、ランダムな文字列になっています。
                </Typography>
                <Divider />
                <Typography>
                    次に、あなたがこのIDの持ち主であることを証明するためのシークレットコードを作成します。
                </Typography>
                <Button
                    variant="contained"
                    onClick={(): void => {
                        props.next()
                    }}
                >
                    Next: IDのシークレットコードの作成
                </Button>
            </Box>
        </Box>
    )
}
