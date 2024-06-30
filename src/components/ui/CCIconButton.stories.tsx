import type { Meta } from '@storybook/react'
import { CCIconButton } from './CCIconButton'

import CottageIcon from '@mui/icons-material/Cottage'

interface Props extends Meta {}

export default {
    title: 'ui/CCIconButton',
    component: CCIconButton,
    tags: [],
    argTypes: {},
    args: {},
    parameters: {}
}

export const Default = (_: Props): JSX.Element => {
    return (
        <>
            <CCIconButton>
                <CottageIcon />
            </CCIconButton>
            <CCIconButton disabled={true}>
                <CottageIcon />
            </CCIconButton>
        </>
    )
}
