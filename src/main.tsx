import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginGuard } from './utils/LoginGuard'
import { Suspense, lazy } from 'react'
import { FullScreenLoading } from './components/ui/FullScreenLoading'
import { Registration } from './pages/Registration'
import { AccountImport } from './pages/AccountImport'
import { GuestTimelinePage } from './pages/GuestTimeline'
import ApiProvider from './context/ClientContext'
import { PreferenceProvider } from './context/PreferenceContext'
import './i18n'
import { GlobalStateProvider } from './context/GlobalState'

const AppPage = lazy(() => import('./App'))
const Welcome = lazy(() => import('./pages/Welcome'))

let domain = ''
let prvkey = ''
let subkey = ''

try {
    domain = JSON.parse(localStorage.getItem('Domain') || '')
} catch (e) {
    console.log(e)
}

try {
    prvkey = JSON.parse(localStorage.getItem('PrivateKey') || '')
} catch (e) {
    console.log(e)
}

try {
    subkey = JSON.parse(localStorage.getItem('SubKey') || '')
} catch (e) {
    console.log(e)
}

const logined = domain !== '' && (prvkey !== '' || subkey !== '')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ErrorBoundary FallbackComponent={EmergencyKit}>
        <Suspense fallback={<FullScreenLoading message="Loading..." />}>
            <BrowserRouter>
                <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    {!logined ? (
                        <Route path="/register" element={<Registration />} />
                    ) : (
                        <Route path="/register" element={<Navigate to="/" />} />
                    )}
                    <Route path="/import" element={<AccountImport />} />
                    {!logined && <Route path="/:id" element={<GuestTimelinePage page="entity" />} />}
                    {!logined && <Route path="/:authorID/:messageID" element={<GuestTimelinePage page="message" />} />}
                    {!logined && <Route path="/timeline/:id" element={<GuestTimelinePage page="timeline" />} />}
                    <Route
                        path="*"
                        element={
                            <LoginGuard
                                component={
                                    <ApiProvider>
                                        <PreferenceProvider>
                                            <GlobalStateProvider>
                                                <AppPage />
                                            </GlobalStateProvider>
                                        </PreferenceProvider>
                                    </ApiProvider>
                                }
                                redirect="/welcome"
                            />
                        }
                    />
                </Routes>
            </BrowserRouter>
        </Suspense>
    </ErrorBoundary>
)
