import { Navigate, useLocation } from 'react-router-dom'

interface Props {
    component: React.ReactNode
    redirect: string
}

export const LoginGuard = (props: Props): JSX.Element => {
    const host = localStorage.getItem('Host') ?? ''
    const prvkey = localStorage.getItem('PrivateKey') ?? ''
    const address = localStorage.getItem('Address') ?? ''

    if (host === '' || prvkey === '' || address === '')
        return <Navigate to={props.redirect} state={{ from: useLocation() }} replace={true} />

    return <>{props.component}</>
}
