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

export interface StreamElement {
    ID: string
    Values: {
        id: string
    }
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

export interface RTMMessage {
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

export interface User {
    ccaddress: string
    username: string
    avatar: string
    description: string
    homestream: string
    notificationstream: string
}

export interface ServerEvent {
    type: string
    action: string
    body: RTMMessage | Association
}

export interface Emoji {
    publicUrl: string
    name: string
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

interface ConcurrentTypeBackground extends TypeBackground {
    default: string
    paper: string
    contrastText?: string // TODO: remove this
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
