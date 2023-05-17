import { Navigate, useLocation } from 'react-router-dom'

interface Props {
    component: React.ReactNode
    redirect: string
}

export const LoginGuard = (props: Props): JSX.Element => {
    const server = localStorage.getItem('ServerAddress') ?? ''
    const pubkey = localStorage.getItem('PublicKey') ?? ''
    const prvkey = localStorage.getItem('PrivateKey') ?? ''
    const address = localStorage.getItem('Address') ?? ''

    if (server === '' || pubkey === '' || prvkey === '' || address === '')
        return (
            <Navigate
                to={props.redirect}
                state={{ from: useLocation() }}
                replace={false}
            />
        )

    return <>{props.component}</>
}
