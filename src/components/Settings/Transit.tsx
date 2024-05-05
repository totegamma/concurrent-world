import { useClient } from '../../context/ClientContext'
import { useTranslation } from 'react-i18next'

export function Transit(): JSX.Element {
    const { client } = useClient()
    const { t } = useTranslation('', { keyPrefix: 'settings.transit' })

    return <>未実装 unimplimented!()</>
}
