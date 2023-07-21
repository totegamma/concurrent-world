import type { Color, CommonColors, PaletteMode, Theme, TypeBackground } from '@mui/material'
import type {
    Palette,
    PaletteAugmentColorOptions,
    PaletteColor,
    PaletteTonalOffset,
    TypeAction,
    TypeDivider,
    TypeText
} from '@mui/material/styles/createPalette'

import type { CoreStreamElement, Profile } from '@concurrent-world/client'

export interface StreamElementDated extends CoreStreamElement {
    LastUpdated: number
}

export interface Emoji {
    publicUrl: string
    name: string
    aliases: string[]
}

export interface ProfileWithAddress extends Profile {
    // TODO: deprecate
    ccaddress: string
}

export interface ImgurSettings {
    clientId: string
}

interface ConcurrentTypeBackground extends TypeBackground {
    default: string
    paper: string
    contrastText: string
}

interface ConcurrentPalette extends Palette {
    common: CommonColors
    mode: PaletteMode
    contrastThreshold: number
    tonalOffset: PaletteTonalOffset
    primary: PaletteColor
    secondary: PaletteColor
    error: PaletteColor
    warning: PaletteColor
    info: PaletteColor
    success: PaletteColor
    grey: Color
    text: TypeText
    divider: TypeDivider
    action: TypeAction
    background: ConcurrentTypeBackground
    getContrastText: (background: string) => string
    augmentColor: (options: PaletteAugmentColorOptions) => PaletteColor
}

export interface ConcurrentTheme extends Theme {
    palette: ConcurrentPalette
}

export interface StreamList {
    label: string
    pinned: boolean
    expanded: boolean
    items: Followable[]
    defaultPostStreams: string[]
}

export interface Followable {
    type: 'stream' | 'user'
    id: string
    userID?: string
}

export type CCID = string
