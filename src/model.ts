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

import type { CommonstreamSchema, CoreStreamItem, Stream } from '@concurrent-world/client'

export interface StreamItemDated extends CoreStreamItem {
    LastUpdated: number
}

export interface EmojiLite {
    imageURL?: string
    animURL?: string
}

export interface Emoji {
    shortcode: string
    aliases: string[]
    imageURL: string
    animURL?: string
    soundURL?: string
}

export interface RawEmojiPackage {
    name: string
    version: string
    description: string
    credits: string
    iconURL: string
    emojis: Emoji[]
}

export interface EmojiPackage extends RawEmojiPackage {
    packageURL: string
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

export interface ConcurrentThemeMeta {
    name?: string
    author?: string
    comment?: string
}

export interface ConcurrentTheme extends Theme {
    palette: ConcurrentPalette
    meta?: ConcurrentThemeMeta
}

export interface StreamList {
    label: string
    pinned: boolean
    expanded: boolean
    streams: string[]
    userStreams: userHomeStream[]
    defaultPostStreams: string[]
}

export interface userHomeStream {
    streamID: string
    userID: string
}

export interface StreamWithDomain {
    domain: string
    stream: Stream<CommonstreamSchema>
}

export type CCID = string

export interface ApEntity {
    id: string
    ccid: string
    publickey: string
    privatekey: string
    homestream: string
    notificationstream: string
    followstream: string
}

export interface s3Config {
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    bucketName: string
    publicUrl: string
    forcePathStyle: boolean
}
