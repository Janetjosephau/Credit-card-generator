import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Zap,
  CreditCard,
  Menu,
  X
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 w-72 bg-[#0f172a] text-white h-screen shadow-2xl flex flex-col z-40`}
      >
        {/* Logo Section */}
        <div className="p-8 pb-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold italic shadow-lg shadow-emerald-500/20">
            CC
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-4">Test Card</h1>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-1">GENERATOR</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-10 mt-10">
          {/* MENU Category */}
          <div>
            <p className="text-[11px] font-black text-slate-500 tracking-widest uppercase mb-6">Menu</p>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/connections/llm"
                  className={`flex items-center space-x-3 transition-all duration-200 ${
                    isActive('/connections/llm') ? 'text-emerald-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap size={22} className={isActive('/connections/llm') ? 'fill-emerald-500/10' : ''} />
                  <span className="font-bold">LLM Configuration</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* GENERATOR Category */}
          <div>
            <p className="text-[11px] font-black text-slate-500 tracking-widest uppercase mb-6">Generator</p>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className={`flex items-center space-x-3 transition-all duration-200 ${
                    isActive('/') ? 'text-emerald-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={22} className={isActive('/') ? 'fill-emerald-500/10' : ''} />
                  <span className="font-bold">CE Credit Card Generator</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
