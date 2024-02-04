import 'react-markdown'

declare module 'react-markdown' {
    export interface Components {
        userlink?: React.FC<{ ccid: string }>
        emoji?: React.FC<{ shortcode: string }>
        social?: React.FC<{ type: string; icon: string; service: string; children: string }>
        emojipack?: React.FC<{ src: string }>
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            userlink: { ccid: string } & React.DetailedHTMLProps<
                React.AnchorHTMLAttributes<HTMLAnchorElement>,
                HTMLAnchorElement
            >
            emoji: { shortcode: string } & React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLSpanElement>,
                HTMLSpanElement
            >
            social: { type: string; icon: string; service: string; children: string } & React.DetailedHTMLProps<
                React.AnchorHTMLAttributes<HTMLAnchorElement>,
                HTMLAnchorElement
            >
            emojipack: { src: string } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
        }
    }
}
