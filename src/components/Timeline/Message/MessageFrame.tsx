import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { MessageView } from './MessageView'
import { ThinMessageView } from './ThinMessageView'
import { OneLineMessageView } from './OneLineMessageView'

export interface MessageFrameProp {
    message: CCMessage<any>
    reloadMessage: () => void
    lastUpdated?: number
    variant?: 'default' | 'thin' | 'oneline'
    author: Character<Profile> | undefined
    userCCID: string
    streams: Array<Stream<any>>
    favoriteUsers: ProfileWithAddress[]
    reactionUsers: ProfileWithAddress[]
}

export const MessageFrame = (props: MessageFrameProp): JSX.Element => {
    switch (props.variant) {
        case 'thin':
            return (
                <ThinMessageView
                    message={props.message}
                    userCCID={props.userCCID}
                    author={props.author}
                    streams={props.streams}
                    favoriteUsers={props.favoriteUsers}
                    reactionUsers={props.reactionUsers}
                />
            )
        case 'oneline':
            return (
                <OneLineMessageView
                    message={props.message}
                    userCCID={props.userCCID}
                    author={props.author}
                    streams={props.streams}
                    favoriteUsers={props.favoriteUsers}
                    reactionUsers={props.reactionUsers}
                />
            )

        default:
            return (
                <MessageView
                    message={props.message}
                    userCCID={props.userCCID}
                    author={props.author}
                    streams={props.streams}
                    favoriteUsers={props.favoriteUsers}
                    reactionUsers={props.reactionUsers}
                />
            )
    }
}
