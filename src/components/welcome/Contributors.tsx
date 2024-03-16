import { Box, alpha, useTheme } from '@mui/material'

import { PassportRenderer } from '../theming/Passport'
import Tilt from 'react-parallax-tilt'

const contributers = [
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'totegamma',
        avatar: 'https://github.com/totegamma.png',
        host: 'dev.concurrent.world'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'rassi0429',
        avatar: 'https://github.com/rassi0429.png',
        host: 'dev.concurrent.world'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'fono09',
        avatar: 'https://github.com/fono09.png',
        host: 'con.fono.jp'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'waonme',
        avatar: 'https://github.com/waonme.png',
        host: 'dev.concurrent.world'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'naborisk',
        avatar: 'https://github.com/naborisk.png',
        host: 'cc.naborisk.com'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'oinarisummer',
        avatar: 'https://github.com/oinarisummer.png',
        host: 'dev.concurrent.world'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'Zozokasu',
        avatar: 'https://github.com/Zozokasu.png',
        host: 'hub.concurrent.world'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'ouroboros723',
        avatar: 'https://github.com/ouroboros723.png',
        host: 'cc.draboros.net'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'ryotn',
        avatar: 'https://github.com/ryotn.png',
        host: 'hub.concurrent.world'
    },
    {
        ccid: 'CCE919C85E695AdA4acE5d3ae56310435EE0b522a3',
        name: 'tigerwall',
        avatar: 'https://github.com/tigerwall.png',
        host: 'hub.concurrent.world'
    }
]

export default function Contributors(): JSX.Element {
    const theme = useTheme()

    return (
        <Box position="relative" height="300px" width="100%" overflow="hidden">
            <Box
                sx={{
                    position: 'absolute',
                    height: '100%',
                    width: '50px',
                    left: '0',
                    zIndex: 1,
                    background: `linear-gradient(to left, ${alpha(theme.palette.background.default, 0)}, ${
                        theme.palette.background.default
                    })`
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    height: '100%',
                    width: '50px',
                    right: '0',
                    zIndex: 1,
                    background: `linear-gradient(to right, ${alpha(useTheme().palette.background.default, 0)}, ${
                        useTheme().palette.background.default
                    })`
                }}
            />

            <Box
                gap="15px"
                display="flex"
                width={`${contributers.length * 415 * 2}px`}
                my={2}
                sx={{
                    '@keyframes slide': {
                        '0%': {
                            transform: 'translateX(0)'
                        },
                        '100%': {
                            transform: 'translateX(-50%)'
                        }
                    },
                    animation: 'slide 120s linear infinite'
                }}
            >
                {contributers.map((contributer, index) => {
                    return (
                        <Box key={index} minWidth="400px">
                            <Tilt glareEnable={true} glareBorderRadius="5%">
                                <PassportRenderer
                                    ccid={contributer.ccid}
                                    name={contributer.name}
                                    avatar={contributer.avatar}
                                    host={contributer.host}
                                    cdate={'2023/02/04'}
                                    trust={255}
                                />
                            </Tilt>
                        </Box>
                    )
                })}
                {contributers.map((contributer, index) => {
                    return (
                        <Box key={`second-${index}`} minWidth="400px">
                            <Tilt glareEnable={true} glareBorderRadius="5%">
                                <PassportRenderer
                                    ccid={contributer.ccid}
                                    name={contributer.name}
                                    avatar={contributer.avatar}
                                    host={contributer.host}
                                    cdate={'2023/02/04'}
                                    trust={255}
                                />
                            </Tilt>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}
