import { Box, type SxProps } from '@mui/material'
import Wallpaper from '../../resources/cc-wallpaper-base.png'

export interface CCWallpaperProps {
    sx?: SxProps
    innerSx?: SxProps
    override?: string
    children?: JSX.Element | JSX.Element[]
}

export const CCWallpaper = (props: CCWallpaperProps): JSX.Element => {
    return (
        <Box
            sx={{
                backgroundColor: 'primary.main',
                ...props.sx
            }}
        >
            <Box
                sx={{
                    backgroundImage: `url(${props.override || Wallpaper})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    mixBlendMode: props.override ? 'normal' : 'hard-light',
                    width: '100%',
                    height: '100%',
                    ...props.innerSx
                }}
            >
                {props.children}
            </Box>
        </Box>
    )
}
