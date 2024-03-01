import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginGuard } from './utils/LoginGuard'
import { Suspense, lazy } from 'react'
import { FullScreenLoading } from './components/ui/FullScreenLoading'
import { Registration } from './pages/Registration'
import { AccountImport } from './pages/AccountImport'
import { GuestTimelinePage } from './pages/GuestTimeline'
import ApiProvider from './context/ClientContext'
import { PreferenceProvider } from './context/PreferenceContext'
import './i18n'

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
                    <Route path="/register" element={<Registration />} />
                    <Route path="/import" element={<AccountImport />} />
                    {!logined && <Route path="/stream/:id" element={<GuestTimelinePage page="stream" />} />}
                    {!logined && <Route path="/entity/:id" element={<GuestTimelinePage page="entity" />} />}
                    {!logined && <Route path="/message/:id" element={<GuestTimelinePage page="message" />} />}
                    <Route
                        path="*"
                        element={
                            <LoginGuard
                                component={
                                    <ApiProvider>
                                        <PreferenceProvider>
                                            <AppPage />
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
