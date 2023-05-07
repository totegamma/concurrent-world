import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline } from '@mui/material'
import { ErrorBoundary } from 'react-error-boundary'
import { EmergencyKit } from './components/EmergencyKit'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <>
        <ErrorBoundary fallback={<EmergencyKit />}>
            <CssBaseline />
            <App />
        </ErrorBoundary>
    </>
)
