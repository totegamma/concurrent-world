import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginGuard } from './components/LoginGuard'
import { Suspense, lazy } from 'react'
import { FullScreenLoading } from './components/FullScreenLoading'

const AppPage = lazy(() => import('./App'))

const Welcome = lazy(() => import('./pages/Welcome'))

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ErrorBoundary fallback={<EmergencyKit />}>
        <CssBaseline />
        <BrowserRouter>
            <Suspense fallback={<FullScreenLoading message="Loading..." />}>
                <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="*" element={<LoginGuard component={<AppPage />} redirect="/welcome" />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    </ErrorBoundary>
)
