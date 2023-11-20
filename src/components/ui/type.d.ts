import 'react-markdown'

declare module 'react-markdown' {
    export interface Components {
        userlink?: React.FC<{ url: string }>
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            userlink: { url: string } & React.DetailedHTMLProps<
                React.AnchorHTMLAttributes<HTMLAnchorElement>,
                HTMLAnchorElement
            >
        }
    }
}
