import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Upload as UploadIcon, FileText, X, Loader, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../lib/animations'
import './Upload.css'

const SUBJECTS = [
  'Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Mathematics', 'Digital Electronics', 'OOP', 'Software Engineering',
  'Machine Learning', 'Web Development', 'Other'
]

const RESOURCE_TYPES = [
  { value: 'NOTES', label: 'Notes' },
  { value: 'PAST_PAPER', label: 'Past Paper' },
  { value: 'REFERENCE_BOOK', label: 'Reference Book' },
  { value: 'PROJECT_REPORT', label: 'Project Report' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
]

export default function UploadPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '',
    year: '',
    type: 'NOTES',
    tags: '',
  })

  if (!isAuthenticated) {
    return (
      <motion.div className="upload-page" {...pageTransition}>
        <motion.div
          className="upload-auth-wall"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <UploadIcon size={48} className="auth-wall-icon" />
          </motion.div>
          <h2>Sign in to upload</h2>
          <p>You need to be logged in to share resources with the community.</p>
          <motion.button
            className="btn-primary"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </motion.div>
        
      </motion.div>
    )
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      if (selected.size > 25 * 1024 * 1024) {
        toast.error('File size must be under 25MB')
        return
      }
      setFile(selected)
    }
  }

  const removeFile = () => setFile(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.subject) return toast.error('Subject is required')
    if (!form.semester) return toast.error('Semester is required')

    setLoading(true)
    setUploadProgress(10)

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}-${file.name}`

      setUploadProgress(30)

      const { data: storageData, error: storageError } = await supabase.storage
        .from('resource_files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (storageError) throw storageError
      setUploadProgress(60)

      const { data: urlData } = supabase.storage
        .from('resource_files')
        .getPublicUrl(filePath)

      const fileUrl = urlData.publicUrl
      setUploadProgress(80)

      const { error: insertError } = await supabase.from('resources').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        subject: form.subject,
        semester: parseInt(form.semester),
        year: parseInt(form.year) || new Date().getFullYear(),
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        uploader_id: user.id,
      })

      if (insertError) throw insertError

      setUploadProgress(100)
      toast.success('Resource uploaded! +10 points 🎉')

      setTimeout(() => navigate('/browse'), 1200)
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formFields = [
    { name: 'title', label: 'Title *', type: 'text', placeholder: 'e.g. Data Structures Notes — Trees & Graphs', required: true },
  ]

  return (
    <motion.div className="upload-page" {...pageTransition}>
      <div className="upload-container">
        <motion.div
          className="upload-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1>Upload Resource</h1>
          <p>Share your notes, past papers, or assignments with the campus community</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Title */}
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="input-field"
              placeholder="e.g. Data Structures Notes — Trees & Graphs"
              value={form.title}
              onChange={handleChange}
              required
            />
          </motion.div>

          {/* Description */}
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="input-field upload-textarea"
              placeholder="Brief description of what's in this resource..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </motion.div>

          {/* Subject + Semester row */}
          <motion.div
            className="form-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select name="subject" className="input-field" value={form.subject} onChange={handleChange} required>
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select name="semester" className="input-field" value={form.semester} onChange={handleChange} required>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Semester {n}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Type + Year row */}
          <motion.div
            className="form-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="form-group">
              <label className="form-label">Resource Type</label>
              <select name="type" className="input-field" value={form.type} onChange={handleChange}>
                {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                name="year"
                className="input-field"
                placeholder={new Date().getFullYear()}
                value={form.year}
                onChange={handleChange}
                min={2015}
                max={2030}
              />
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              className="input-field"
              placeholder="e.g. trees, algorithms, sorting"
              value={form.tags}
              onChange={handleChange}
            />
          </motion.div>

          {/* File Upload */}
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <label className="form-label">File * (max 25MB)</label>
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.label
                  className="file-drop-zone"
                  htmlFor="file-input"
                  key="dropzone"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <UploadIcon size={32} className="drop-icon" />
                  </motion.div>
                  <span className="drop-text">Click to select a file</span>
                  <span className="drop-hint">PDF, DOCX, PPT, ZIP — up to 25MB</span>
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.md"
                    hidden
                  />
                </motion.label>
              ) : (
                <motion.div
                  className="file-preview"
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  <FileText size={20} />
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <motion.button
                    type="button"
                    className="file-remove"
                    onClick={removeFile}
                    whileHover={{ scale: 1.2, color: 'var(--danger)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Progress bar */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className="progress-bar-container"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="progress-bar"
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.button
              type="submit"
              className="btn-primary upload-submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(108, 92, 231, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={16} />
                  </motion.div>
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <UploadIcon size={16} />
                  Upload Resource (+10 pts)
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
      
    </motion.div>
  )
}

