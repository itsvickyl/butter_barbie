import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { pageTransition } from '../lib/animations'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to sign in')
    } else {
      toast.success('Welcome back!')
      navigate('/')
    }
  }

  return (
    <motion.div className="auth-page" {...pageTransition}>
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="auth-left">
          <div className="auth-left-content">
            <motion.div
              className="auth-brand"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                className="auth-brand-icon"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <BookOpen size={28} />
              </motion.div>
              <h2>CampusShare</h2>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Welcome back.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Sign in to access your academic resources and continue contributing to the campus community.
            </motion.p>
            <motion.div
              className="auth-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { num: '500+', label: 'Resources' },
                { num: '200+', label: 'Contributors' },
                { num: '8', label: 'Semesters' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="stat-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                >
                  <span className="stat-num">{stat.num}</span>
                  <span className="stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <motion.h2
              className="auth-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Sign In
            </motion.h2>
            <motion.p
              className="auth-subtitle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Enter your credentials to continue
            </motion.p>

            <form onSubmit={handleSubmit} className="auth-form">
              {[
                { id: 'login-email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@university.edu', value: email, onChange: (e) => setEmail(e.target.value), autoComplete: 'email' },
                { id: 'login-password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Enter your password', value: password, onChange: (e) => setPassword(e.target.value), autoComplete: 'current-password' },
              ].map((field, i) => (
                <motion.div
                  key={field.id}
                  className="form-group"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                >
                  <label className="form-label" htmlFor={field.id}>{field.label}</label>
                  <div className="input-wrapper">
                    <field.icon size={18} className="input-icon" />
                    <input
                      id={field.id}
                      type={field.type}
                      className="input-field input-with-icon"
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={field.onChange}
                      autoComplete={field.autoComplete}
                    />
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <motion.button
                  type="submit"
                  className="btn-primary auth-submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(108, 92, 231, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <motion.span
                      className="spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              className="auth-switch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </motion.p>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
