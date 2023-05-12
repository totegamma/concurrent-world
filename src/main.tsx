import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline } from '@mui/material'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Welcome } from './pages/Welcome'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ErrorBoundary fallback={<EmergencyKit />}>
        <CssBaseline />
        <BrowserRouter>
            <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="*" element={<App />} />
            </Routes>
        </BrowserRouter>
    </ErrorBoundary>
)
