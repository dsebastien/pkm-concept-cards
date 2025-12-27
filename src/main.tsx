import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import RandomConceptPage from './pages/random'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/concept/:conceptId' element={<HomePage />} />
                    <Route path='/tag/:tagName' element={<HomePage />} />
                    <Route path='/random' element={<RandomConceptPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
