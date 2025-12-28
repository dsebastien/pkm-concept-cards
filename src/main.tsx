import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import CategoriesPage from './pages/categories'
import DisclaimerPage from './pages/disclaimer'
import FeaturedPage from './pages/featured'
import RandomConceptPage from './pages/random'
import StatisticsPage from './pages/statistics'
import UnexploredPage from './pages/unexplored'
import BooksPage from './pages/books'
import ArticlesPage from './pages/articles'
import ReferencesPage from './pages/references'
import NotesPage from './pages/notes'
import HistoryPage from './pages/history'

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
                    <Route path='/category/:categoryName' element={<HomePage />} />
                    <Route path='/categories' element={<CategoriesPage />} />
                    <Route path='/featured' element={<FeaturedPage />} />
                    <Route path='/random' element={<RandomConceptPage />} />
                    <Route path='/statistics' element={<StatisticsPage />} />
                    <Route path='/unexplored' element={<UnexploredPage />} />
                    <Route path='/disclaimer' element={<DisclaimerPage />} />
                    <Route path='/books' element={<BooksPage />} />
                    <Route path='/books/:bookId' element={<BooksPage />} />
                    <Route path='/articles' element={<ArticlesPage />} />
                    <Route path='/articles/:articleId' element={<ArticlesPage />} />
                    <Route path='/references' element={<ReferencesPage />} />
                    <Route path='/references/:referenceId' element={<ReferencesPage />} />
                    <Route path='/notes' element={<NotesPage />} />
                    <Route path='/notes/:noteId' element={<NotesPage />} />
                    <Route path='/history' element={<HistoryPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
