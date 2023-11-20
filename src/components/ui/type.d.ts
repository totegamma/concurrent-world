import 'react-markdown'

declare module 'react-markdown' {
    export interface Components {
        userlink?: React.FC<{ ccid: string }>
        emoji?: React.FC<{ shortcode: string }>
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
        }
    }
}
