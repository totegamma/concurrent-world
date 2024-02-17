import { Navigate, useLocation } from 'react-router-dom'

interface Props {
    component: React.ReactNode
    redirect: string
}

export const LoginGuard = (props: Props): JSX.Element => {
    const domainStr = localStorage.getItem('Domain')
    const prvkeyStr = localStorage.getItem('PrivateKey')
    const subKeyStr = localStorage.getItem('SubKey')

    let redirect = false

    if (domainStr === null || (prvkeyStr === null && subKeyStr === null)) redirect = true

    try {
        const domain = JSON.parse(domainStr || '')
        const prvkey = JSON.parse(prvkeyStr || '')
        const subkey = JSON.parse(subKeyStr || '')
        if (domain === '' || (prvkey === '' && subkey === '')) redirect = true
    } catch (e) {
        redirect = true
    }

    if (redirect) {
        return <Navigate to={props.redirect} state={{ from: useLocation() }} replace={true} />
    }

    return <>{props.component}</>
}
