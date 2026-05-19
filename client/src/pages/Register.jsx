import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, UserIcon, Building, Hash, ArrowRight, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { pageTransition } from '../lib/animations'
import './Register.css'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: '',
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await signUp(form.email, form.password, {
      name: form.name,
      department: form.department || undefined,
      year: form.year ? parseInt(form.year) : undefined,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to create account')
    } else {
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    }
  }

  const features = [
    'Upload and share your notes',
    'Search by subject and semester',
    'Download resources instantly',
    'Build your contributor profile',
  ]

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
              Join the community.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Create your account and start sharing academic resources with
              fellow students. Upload notes, find past papers, and help build
              the campus knowledge base.
            </motion.p>
            <div className="auth-features">
              {features.map((feat, i) => (
                <motion.div
                  key={feat}
                  className="feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                >
                  <motion.span
                    className="feature-dot"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  />
                  {feat}
                </motion.div>
              ))}
            </div>
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
              Create Account
            </motion.h2>
            <motion.p
              className="auth-subtitle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Fill in your details to get started
            </motion.p>

            <form onSubmit={handleSubmit} className="auth-form">
              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
                <div className="input-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    className="input-field input-with-icon"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={update('name')}
                  />
                </div>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="form-label" htmlFor="reg-email">Email *</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="input-field input-with-icon"
                    placeholder="you@university.edu"
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              <motion.div
                className="form-row"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-dept">Department</label>
                  <div className="input-wrapper">
                    <Building size={18} className="input-icon" />
                    <input
                      id="reg-dept"
                      type="text"
                      className="input-field input-with-icon"
                      placeholder="e.g. CSE"
                      value={form.department}
                      onChange={update('department')}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-year">Year</label>
                  <div className="input-wrapper">
                    <Hash size={18} className="input-icon" />
                    <select
                      id="reg-year"
                      className="input-field input-with-icon"
                      value={form.year}
                      onChange={update('year')}
                    >
                      <option value="">Select</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="form-label" htmlFor="reg-password">Password *</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-password"
                    type="password"
                    className="input-field input-with-icon"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={update('password')}
                    autoComplete="new-password"
                  />
                </div>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
              >
                <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-confirm"
                    type="password"
                    className="input-field input-with-icon"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    autoComplete="new-password"
                  />
                </div>
              </motion.div>

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
                      Create Account
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
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </motion.p>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
