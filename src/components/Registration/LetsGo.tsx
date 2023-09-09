import { Box, Button } from "@mui/material"
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from "../theming/Passport"

export function RegistrationReady(props: {next: ()=>void}): JSX.Element {
    return (<>
            <Box
                sx={{
                    padding: '30px',
                    maxWidth: '600px',
                    margin: 'auto'
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <PassportRenderer
                        theme={theme}
                        ccid={CCID}
                        name={profile?.username ?? ''}
                        avatar={profile?.avatar ?? ''}
                        host={host?.fqdn ?? ''}
                        cdate={new Date().toLocaleDateString()}
                        trust={0}
                    />
                </Tilt>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                <Button variant="contained" onClick={props.next}>
                    はじめる
                </Button>
            </Box>
    </>)
}

