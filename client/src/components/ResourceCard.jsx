import { Link } from 'react-router-dom'
import { Download, Star, FileText, BookOpen, ClipboardList, File, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'
import './ResourceCard.css'

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

export default function ResourceCard({ resource, index = 0 }) {
  const TypeIcon = typeIcons[resource.type] || FileText

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -6,
        boxShadow: '0 0 35px rgba(108, 92, 231, 0.18)',
        borderColor: 'rgba(108, 92, 231, 0.35)',
      }}
      style={{
        background: 'rgba(26, 26, 37, 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 'var(--radius-lg)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <Link to={`/resource/${resource.id}`} className="resource-card" id={`resource-${resource.id}`}>
        <div className="rc-header">
          <motion.div
            className="rc-type-badge"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <TypeIcon size={14} />
            <span>{typeLabels[resource.type] || resource.type}</span>
          </motion.div>
          {resource.avgRating > 0 && (
            <div className="rc-rating">
              <Star size={13} fill="var(--warning)" stroke="var(--warning)" />
              <span>{resource.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <h3 className="rc-title">{resource.title}</h3>

        {resource.description && (
          <p className="rc-desc">{resource.description.slice(0, 100)}{resource.description.length > 100 ? '…' : ''}</p>
        )}

        <div className="rc-meta">
          <span className="rc-subject">{resource.subject}</span>
          <span className="rc-dot">·</span>
          <span>Sem {resource.semester}</span>
        </div>

        <div className="rc-footer">
          <span className="rc-uploader">
            {resource.uploader?.name || 'Anonymous'}
          </span>
          <span className="rc-downloads">
            <Download size={13} />
            {resource.downloadCount || 0}
          </span>
        </div>

      </Link>
    </motion.div>
  )
}
