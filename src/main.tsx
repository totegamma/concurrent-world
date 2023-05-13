import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline } from '@mui/material'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Welcome } from './pages/Welcome'
import { LoginGuard } from './components/LoginGuard'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ErrorBoundary fallback={<EmergencyKit />}>
        <CssBaseline />
        <BrowserRouter>
            <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route
                    path="*"
                    element={
                        <LoginGuard component={<App />} redirect="/welcome" />
                    }
                />
            </Routes>
        </BrowserRouter>
    </ErrorBoundary>
)
