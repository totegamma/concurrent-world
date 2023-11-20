import 'react-markdown'

declare module 'react-markdown' {
    export interface Components {
        userlink?: React.FC<{ ccid: string }>
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            userlink: { ccid: string } & React.DetailedHTMLProps<
                React.AnchorHTMLAttributes<HTMLAnchorElement>,
                HTMLAnchorElement
            >
        }
    }
}
