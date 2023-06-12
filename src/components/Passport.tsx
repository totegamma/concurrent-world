import { Box, useTheme } from '@mui/material'
import { type ConcurrentTheme } from '../model'
import { ApplicationContext } from '../App'
import { useContext } from 'react'
import { useApi } from '../context/api'

export function Passport(): JSX.Element {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const theme = useTheme<ConcurrentTheme>()

    const line1 = 'P<' + api.userAddress
    let line2 = api.host?.fqdn.toUpperCase().replace(/(\.|-)/g, '<') ?? 'UNKNOWN'
    line2 += '<'.repeat(40 - line2.length) + '0xFF'

    const cdate = new Date(appData.profile?.payload.signedAt ?? 0)

    const style1 = {
        fontSize: '5px',
        fill: theme.palette.primary.contrastText,
        fontFamily: 'SourceCodeProRoman-Regular, Source Code Pro',
        fontVariationSettings: 'wght 400'
    }

    const style2 = {
        fontSize: '6px',
        fill: theme.palette.primary.contrastText,
        fontFamily: 'SourceCodeProRoman-Regular, Source Code Pro',
        fontVariationSettings: 'wght 400'
    }

    const style3 = {
        fontSize: '8px',
        fill: theme.palette.primary.contrastText,
        fontFamily: 'SourceCodeProRoman-Regular, Source Code Pro',
        fontVariationSettings: 'wght 600'
    }

    return (
        <Box
            sx={{
                filter: 'drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.2))'
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 242.65 153.01">
                <path
                    fill={theme.palette.primary.main}
                    d="m233.21,0H9.44C4.23,0,0,4.23,0,9.44v134.14c0,5.21,4.23,9.44,9.44,9.44h223.77c5.21,0,9.44-4.23,9.44-9.44V9.44c0-5.21-4.23-9.44-9.44-9.44Zm-93.33,14.34h-37.1c-2.2,0-3.98-1.78-3.98-3.98s1.78-3.98,3.98-3.98h37.1c2.2,0,3.98,1.78,3.98,3.98s-1.78,3.98-3.98,3.98Z"
                />

                <text style={style3} transform="translate(12 14)">
                    <tspan x="0" y="0">
                        CONCURRENT
                    </tspan>
                </text>

                <text style={style1} transform="translate(100 30)">
                    <tspan x="0" y="0">
                        current name
                    </tspan>
                </text>
                <text style={style3} transform="translate(100 40)">
                    <tspan x="0" y="0">
                        {appData.profile?.payload.body.username}
                    </tspan>
                </text>

                <text style={style1} transform="translate(100 60)">
                    <tspan x="0" y="0">
                        current address
                    </tspan>
                </text>
                <text style={style3} transform="translate(100 70)">
                    <tspan x="0" y="0">
                        {api.host?.fqdn}
                    </tspan>
                </text>

                <text style={style1} transform="translate(100 90)">
                    <tspan x="0" y="0">
                        registered
                    </tspan>
                </text>
                <text style={style3} transform="translate(100 100)">
                    <tspan x="0" y="0">
                        {cdate.toLocaleDateString()}
                    </tspan>
                </text>

                <text style={style3} transform="translate(200 100)">
                    <tspan x="0" y="0">
                        100
                    </tspan>
                </text>

                <text style={style1} transform="translate(12 118)">
                    <tspan x="0" y="0">
                        You are permitted to travel to other servers
                    </tspan>
                    <tspan x="0" y="5">
                        under the trust held by {api.host?.fqdn}.
                    </tspan>
                </text>

                <text style={style3} transform="translate(12 135)">
                    <tspan x="0" y="0">
                        {line1}
                    </tspan>
                    <tspan x="0" y="10">
                        {line2}
                    </tspan>
                </text>

                <path
                    style={style2}
                    d="m53.14,100.35c-5.12,0-10.08-1-14.76-2.98-4.51-1.91-8.57-4.64-12.05-8.12s-6.21-7.53-8.12-12.05c-1.98-4.68-2.98-9.64-2.98-14.76s1-10.08,2.98-14.76c1.91-4.51,4.64-8.57,8.12-12.05s7.53-6.21,12.05-8.12c4.68-1.98,9.64-2.98,14.76-2.98v8.8c-16.05,0-29.1,13.06-29.1,29.1s13.06,29.1,29.1,29.1,29.1-13.06,29.1-29.1h8.8c0,5.12-1,10.08-2.98,14.76-1.91,4.51-4.64,8.57-8.12,12.05-3.48,3.48-7.53,6.21-12.05,8.12-4.68,1.98-9.64,2.98-14.76,2.98Z"
                />

                <mask id="passportMask">
                    <circle cx="53.14" cy="62.44" r="25" fill="white" />
                </mask>
                <image
                    mask={'url(#passportMask)'}
                    href={appData.profile?.payload.body.avatar || ''}
                    x="28.14"
                    y="37.44"
                    width="50"
                    height="50"
                />
            </svg>
        </Box>
    )
}
