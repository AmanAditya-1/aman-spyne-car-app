import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Login from './components/Login'
import SignUp from './components/SignUp'
import CarList from './components/CarList'
import CarCreate from './components/CarCreate'
import CarDetail from './components/CarDetail'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  const PublicRoute = ({ children }) => {
    return isAuthenticated ? <Navigate to="/cars" /> : children
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login setIsAuthenticated={setIsAuthenticated} /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/cars" element={<PrivateRoute><CarList /></PrivateRoute>} />
            <Route path="/cars/create" element={<PrivateRoute><CarCreate /></PrivateRoute>} />
            <Route path="/cars/:id" element={<PrivateRoute><CarDetail /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/cars" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}