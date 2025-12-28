import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import CategoriesPage from './pages/categories'
import FeaturedPage from './pages/featured'
import RandomConceptPage from './pages/random'
import StatisticsPage from './pages/statistics'
import UnexploredPage from './pages/unexplored'

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
                    <Route path='/tag/:tagName/concept/:conceptId' element={<HomePage />} />
                    <Route path='/category/:categoryName' element={<HomePage />} />
                    <Route
                        path='/category/:categoryName/concept/:conceptId'
                        element={<HomePage />}
                    />
                    <Route path='/categories' element={<CategoriesPage />} />
                    <Route path='/categories/concept/:conceptId' element={<CategoriesPage />} />
                    <Route path='/featured' element={<FeaturedPage />} />
                    <Route path='/featured/concept/:conceptId' element={<FeaturedPage />} />
                    <Route path='/random' element={<RandomConceptPage />} />
                    <Route path='/statistics' element={<StatisticsPage />} />
                    <Route path='/unexplored' element={<UnexploredPage />} />
                    <Route path='/unexplored/concept/:conceptId' element={<UnexploredPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
