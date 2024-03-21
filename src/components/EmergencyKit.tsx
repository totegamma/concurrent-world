import { type FallbackProps } from 'react-error-boundary'
import { type Preference, defaultPreference } from '../context/PreferenceContext'

export function EmergencyKit({ error }: FallbackProps): JSX.Element {
    const gracefulResetLocalStorage = (): void => {
        for (const key in localStorage) {
            if (['PrivateKey', 'PublicKey', 'ServerAddress'].includes(key)) continue
            localStorage.removeItem(key)
        }
    }

    const resetAllLocalstorage = (): void => {
        for (const key in localStorage) {
            localStorage.removeItem(key)
        }

        window.location.reload()
    }

    const resetThemeAndEnterSafemode = (): void => {
        const preference = localStorage.getItem('preference')
        if (preference) {
            const parsed: Preference = JSON.parse(preference)
            parsed.themeName = defaultPreference.themeName
            localStorage.setItem('preference', JSON.stringify(parsed))
        }

        localStorage.setItem('noloadsettings', 'true')

        window.location.reload()
    }

    return (
        <>
            <h1>Emergency!</h1>
            どうしようもないエラーが発生しました。
            <br />
            {error?.message}
            <button
                style={{ height: '100px', width: '100%' }}
                onClick={(): void => {
                    window.location.reload()
                }}
            >
                とりあえずリロード
            </button>
            <h2>Medical Kit</h2>
            <div>3回くらいリロードしても解決しないなら↓</div>
            <div>
                <button onClick={resetThemeAndEnterSafemode}>テーマをリセットして初回設定同期オフで起動する</button>
            </div>
            <div>
                <button onClick={gracefulResetLocalStorage}>
                    アカウント情報以外のlocalstorageをすべてリセットする
                </button>
            </div>
            <div>
                <button onClick={resetAllLocalstorage}>localStorageをすべてリセットする</button>
            </div>
            <h2>Debug Info</h2>
            <pre>{error ? error.stack : 'そんなものはない'}</pre>
        </>
    )
}
