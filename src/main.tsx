import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { LoginGuard } from './components/LoginGuard'
import { Suspense, lazy } from 'react'
import { FullScreenLoading } from './components/FullScreenLoading'
import { Registration } from './pages/Registration'
import { AccountImport } from './pages/AccountImport'
import { GuestTimelinePage } from './pages/GuestTimeline'

const AppPage = lazy(() => import('./App'))

const Welcome = lazy(() => import('./pages/Welcome'))

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/import" element={<AccountImport />} />
            <Route path="/guest/" element={<GuestTimelinePage />} />
            <Route path="*" element={<LoginGuard component={<AppPage />} redirect="/welcome" />} />
        </>
    )
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ErrorBoundary fallback={<EmergencyKit />}>
        <Suspense fallback={<FullScreenLoading message="Loading..." />}>
            <RouterProvider router={router} />
        </Suspense>
    </ErrorBoundary>
)
