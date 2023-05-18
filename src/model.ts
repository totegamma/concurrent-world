import type {
    Color,
    CommonColors,
    PaletteMode,
    Theme,
    TypeBackground
} from '@mui/material'
import type {
    Palette,
    PaletteAugmentColorOptions,
    PaletteColor,
    PaletteTonalOffset,
    TypeAction,
    TypeDivider,
    TypeText
} from '@mui/material/styles/createPalette'

import type { Profile } from './schemas/profile'

export interface StreamElement {
    ID: string
    Values: {
        id: string
    }
}

export interface StreamElementDated extends StreamElement {
    LastUpdated: number
}

export interface Association {
    author: string
    cdate: string
    id: string
    payload: string
    schema: string
    signature: string
    target: string
}

export interface Message {
    associations: string
    associations_data: Association[]
    author: string
    cdate: string
    id: string
    payload: string
    schema: string
    signature: string
    streams: string
}

export interface ServerEvent {
    type: string
    action: string
    body: Message | Association
}

export interface Emoji {
    publicUrl: string
    name: string
    aliases: string[]
}

export interface ProfileWithAddress extends Profile {
    ccaddress: string
}

export interface Stream {
    id: string
    author: string
    maintainer: string[]
    writer: string[]
    reader: string[]
    schema: string
    meta: string
    signature: string
    cdate: string
}

export interface ImgurSettings {
    clientId: string
    clientSecret: string
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
