import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import NotificationSystem from '../notifications/NotificationSystem' 

const Layout = () => {
  const { user, userType } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleMainClick = () => {
    if (window.innerWidth < 768 && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="relative flex h-screen bg-gray-50 overflow-hidden">
      <NotificationSystem />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300
        md:relative md:translate-x-0 md:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar closeMobileMenu={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6"
          onClick={handleMainClick}
        >
          <div className="max-w-[1400px] mx-auto">
            <Outlet context={{ user, userType }} />
          </div>
        </main>
      </div>

      {/* ChatBot Container */}
      <div id="chatbot-container" className="fixed bottom-0 right-0 w-auto h-auto z-[100]" />
    </div>
  )
}

export default Layout