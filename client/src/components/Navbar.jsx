import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Upload, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Navbar.css'

export default function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setMobileOpen(false)
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
          <motion.div
            className="brand-icon"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <BookOpen size={20} />
          </motion.div>
          <span className="brand-text">
            Campus<span className="gradient-text">Share</span>
          </span>
        </Link>

        <motion.button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {[
            { to: '/browse', label: 'Browse' },
            { to: '/leaderboard', label: 'Leaderboard' },
          ].map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            >
              <Link
                to={item.to}
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}

          {isAuthenticated ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Link
                  to="/upload"
                  className="nav-link upload-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <Upload size={16} />
                  Upload
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <Link
                  to="/profile"
                  className="nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <User size={16} />
                  Profile
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <button className="nav-signout" onClick={handleSignOut}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Link
                  to="/register"
                  className="btn-primary nav-cta"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>

    </motion.nav>
  )
}
