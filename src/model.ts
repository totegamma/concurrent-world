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

import type { Profile } from './schemas/profile'

export interface ServerEvent {
    stream: string
    type: string
    action: string
    body: StreamElement
}

export interface StreamElement {
    timestamp: string
    id: string
    author: string
    currenthost: string
}

export interface StreamElementDated extends StreamElement {
    LastUpdated: number
}

export interface Entity {
    ccaddr: string
    role: string
    host: string
    cdate: string
}

export interface SignedObject<T> {
    signer: string
    type: string
    schema: string
    body: T
    meta: any
    signedAt: string
    target?: string
}

export interface Association<T> {
    author: string
    cdate: string
    id: string
    payload: T
    schema: string
    signature: string
    targetID: string
    targetType: string
}

export interface MessagePostRequest {
    signedObject: string
    signature: string
    streams: string[]
}

export interface Message<T> {
    associations: Array<Association<any>>
    author: string
    cdate: string
    id: string
    payload: SignedObject<T>
    schema: string
    signature: string
    streams: string[]
}

export interface Character<T> {
    associations: Array<Association<any>>
    author: string
    schema: string
    id: string
    payload: SignedObject<T>
    signature: string
    cdate: string
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

export interface Host {
    fqdn: string
    ccaddr: string
    role: string
    pubkey: string
    cdate: Date
}

export interface Stream<T> {
    id: string
    author: string
    maintainer: string[]
    writer: string[]
    reader: string[]
    schema: string
    payload: T
    signature: string
    cdate: string
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
