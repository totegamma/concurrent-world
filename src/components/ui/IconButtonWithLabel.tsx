import { Typography, ButtonBase, type SvgIconTypeMap } from '@mui/material'
import { type OverridableComponent } from '@mui/material/OverridableComponent'
import { Link as RouterLink } from 'react-router-dom'

export const IconButtonWithLabel = (props: {
    icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>
    label: string
    link?: boolean
    to?: string
    onClick?: () => void
}): JSX.Element => {
    return (
        <ButtonBase
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                color: 'primary.main',
                p: 1,
                borderRadius: 1,
                height: '80px',
                width: '80px'
            }}
            component={props.link ? RouterLink : 'button'}
            to={props.to}
            onClick={props.onClick}
        >
            <props.icon
                sx={{
                    fontSize: '40px',
                    color: 'primary.main'
                }}
            />
            <Typography
                color="text.primary"
                sx={{
                    wordBreak: 'keep-all'
                }}
            >
                {props.label}
            </Typography>
        </ButtonBase>
    )
}
