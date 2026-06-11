import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LLMConfiguration from './pages/LLMConfiguration'
import CECreditCardGenerator from './pages/CECreditCardGenerator'
import GuestpayCreditCardGenerator from './pages/GuestpayCreditCardGenerator'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <Router>
      <div className="app-container flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto h-full">
          <Routes>
            <Route path="/" element={<CECreditCardGenerator />} />
            <Route path="/guestpay" element={<GuestpayCreditCardGenerator />} />
            <Route path="/connections/llm" element={<LLMConfiguration />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
