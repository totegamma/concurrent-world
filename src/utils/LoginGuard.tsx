import { Navigate, useLocation } from 'react-router-dom'

interface Props {
    component: React.ReactNode
    redirect: string
}

export const LoginGuard = (props: Props): JSX.Element => {
    const domainStr = localStorage.getItem('Domain')
    const prvkeyStr = localStorage.getItem('PrivateKey')

    let redirect = false

    if (domainStr === null || prvkeyStr === null) redirect = true

    try {
        const domain = JSON.parse(domainStr || '')
        const prvkey = JSON.parse(prvkeyStr || '')
        if (domain === '' || prvkey === '') redirect = true
    } catch (e) {
        redirect = true
    }

    if (redirect) {
        console.log('redirect')
        console.log('domainStr', domainStr)
        console.log('prvkeyStr', prvkeyStr)
        return <Navigate to={props.redirect} state={{ from: useLocation() }} replace={true} />
    }

    return <>{props.component}</>
}
