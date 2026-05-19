import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import {
  FileText, Download, ArrowLeft, Calendar, Loader, BookOpen,
  ClipboardList, FlaskConical, File, User, Clock, Tag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../lib/animations'
import './ResourceDetail.css'

const typeIcons = {
  NOTES: FileText,
  PAST_PAPER: ClipboardList,
  REFERENCE_BOOK: BookOpen,
  PROJECT_REPORT: FlaskConical,
  ASSIGNMENT: File,
}

const typeLabels = {
  NOTES: 'Notes',
  PAST_PAPER: 'Past Paper',
  REFERENCE_BOOK: 'Reference Book',
  PROJECT_REPORT: 'Project Report',
  ASSIGNMENT: 'Assignment',
}

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*, uploader:profiles!uploader_id(id, name, department, points)')
        .eq('id', id)
        .single()

      if (error) throw error
      setResource(data)

      if (user?.id) {
        const { data: ratingData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('resource_id', id)
          .eq('user_id', user.id)
          .single()
        if (ratingData) setUserRating(ratingData.rating)
      }
    } catch (err) {
      console.error('Resource fetch error:', err)
      toast.error('Resource not found')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!resource?.file_url) return
    setDownloading(true)

    try {
      if (user?.id) {
        await supabase.from('downloads').insert({
          user_id: user.id,
          resource_id: resource.id,
        })
        await supabase
          .from('resources')
          .update({ download_count: (resource.download_count || 0) + 1 })
          .eq('id', resource.id)
      }
      window.open(resource.file_url, '_blank')
      toast.success('Download started!')
    } catch (error) {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const handleRating = async (rating) => {
    if (!user?.id) {
      toast.error('Please sign in to rate')
      return
    }
    setRatingLoading(true)
    try {
      const { error } = await supabase.from('ratings').upsert({
        user_id: user.id,
        resource_id: resource.id,
        rating,
      }, { onConflict: 'user_id,resource_id' })

      if (error) throw error
      setUserRating(rating)
      toast.success('Rating submitted!')

      // Recalculate avgRating
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('resource_id', resource.id)

      if (ratings) {
        const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
        await supabase.from('resources').update({ avgRating: avg }).eq('id', resource.id)
        setResource(prev => ({ ...prev, avgRating: avg }))
      }
    } catch (err) {
      toast.error('Failed to submit rating')
    } finally {
      setRatingLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <motion.div className="detail-page loading-screen" {...pageTransition}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={32} />
        </motion.div>
      </motion.div>
    )
  }

  if (!resource) {
    return (
      <motion.div className="detail-page" {...pageTransition}>
        <div className="detail-empty">
          <h2>Resource not found</h2>
          <button className="btn-primary" onClick={() => navigate('/browse')}>Back to Browse</button>
        </div>
      </motion.div>
    )
  }

  const TypeIcon = typeIcons[resource.type] || FileText
  const isPdf = resource.file_url?.endsWith('.pdf')

  return (
    <motion.div className="detail-page" {...pageTransition}>
      {/* Back button */}
      <motion.button
        className="back-btn"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ x: -4, color: 'var(--accent)' }}
      >
        <ArrowLeft size={18} />
        Back
      </motion.button>

      <div className="detail-layout">
        {/* Main content */}
        <motion.div
          className="detail-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div
            className="detail-type-badge"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <TypeIcon size={16} />
            <span>{typeLabels[resource.type] || resource.type}</span>
          </motion.div>

          <motion.h1
            className="detail-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {resource.title}
          </motion.h1>

          {resource.description && (
            <motion.p
              className="detail-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {resource.description}
            </motion.p>
          )}

          {/* Metadata */}
          <motion.div
            className="detail-meta-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="meta-item">
              <BookOpen size={16} className="meta-icon" />
              <div>
                <span className="meta-label">Subject</span>
                <span className="meta-value">{resource.subject}</span>
              </div>
            </div>
            <div className="meta-item">
              <Calendar size={16} className="meta-icon" />
              <div>
                <span className="meta-label">Semester</span>
                <span className="meta-value">Sem {resource.semester}</span>
              </div>
            </div>
            <div className="meta-item">
              <FileText size={16} className="meta-icon" />
              <div>
                <span className="meta-label">File</span>
                <span className="meta-value">{resource.file_name || 'Unknown'} ({formatFileSize(resource.file_size)})</span>
              </div>
            </div>
            <div className="meta-item">
              <Download size={16} className="meta-icon" />
              <div>
                <span className="meta-label">Downloads</span>
                <span className="meta-value">{resource.download_count || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          {resource.tags?.length > 0 && (
            <motion.div
              className="detail-tags"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Tag size={14} className="meta-icon" />
              {resource.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  className="tag-chip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* PDF Preview */}
          {isPdf && (
            <motion.div
              className="pdf-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3>Preview</h3>
              <iframe
                src={resource.file_url + '#toolbar=0'}
                title="PDF Preview"
                className="pdf-iframe"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="detail-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Download button */}
          <motion.button
            className="btn-primary download-btn"
            onClick={handleDownload}
            disabled={downloading}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(108, 92, 231, 0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            {downloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader size={18} />
              </motion.div>
            ) : (
              <Download size={18} />
            )}
            {downloading ? 'Downloading...' : 'Download'}
          </motion.button>

          {/* Rating */}
          <motion.div
            className="sidebar-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4>Rate this resource</h4>
            <StarRating
              rating={userRating}
              onRate={handleRating}
              disabled={ratingLoading || !user}
            />
            {resource.avgRating > 0 && (
              <p className="avg-rating">Average: {resource.avgRating.toFixed(1)} / 5</p>
            )}
          </motion.div>

          {/* Uploader */}
          {resource.uploader && (
            <motion.div
              className="sidebar-card uploader-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4>Uploaded by</h4>
              <div className="uploader-info">
                <motion.div
                  className="uploader-avatar"
                  whileHover={{ scale: 1.1 }}
                >
                  <User size={18} />
                </motion.div>
                <div>
                  <p className="uploader-name">{resource.uploader.name}</p>
                  <p className="uploader-dept">{resource.uploader.department}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Date */}
          <motion.div
            className="sidebar-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="date-info">
              <Clock size={14} className="meta-icon" />
              <span>Uploaded {new Date(resource.created_at).toLocaleDateString()}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </motion.div>
  )
}
