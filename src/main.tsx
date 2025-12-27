import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <HashRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/concept/:conceptId' element={<HomePage />} />
                    <Route path='/tag/:tagName' element={<HomePage />} />
                </Route>
            </Routes>
        </HashRouter>
    </React.StrictMode>
)
