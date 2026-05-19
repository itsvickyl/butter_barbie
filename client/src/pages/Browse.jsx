import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ResourceCard from '../components/ResourceCard'
import { Search, Filter, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../lib/animations'
import './Browse.css'

export default function Browse() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    subject: '',
    semester: '',
    type: '',
    sort: 'newest',
  })

  useEffect(() => {
    fetchResources()
  }, [filters])

  const fetchResources = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('resources')
        .select('*, uploader:profiles!uploader_id(id, name, department, points)')

      if (filters.subject) query = query.eq('subject', filters.subject)
      if (filters.semester) query = query.eq('semester', parseInt(filters.semester))
      if (filters.type) query = query.eq('type', filters.type)

      if (filters.sort === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filters.sort === 'downloads') {
        query = query.order('download_count', { ascending: false })
      }

      query = query.limit(50)

      const { data, error } = await query
      if (error) throw error
      setResources(data || [])
    } catch (err) {
      console.error('Browse fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchResources()
      return
    }
    searchResources()
  }

  const searchResources = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*, uploader:profiles!uploader_id(id, name, department, points)')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setResources(data || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources

  return (
    <motion.div className="browse-page" {...pageTransition}>
      <motion.div
        className="browse-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1>Browse Resources</h1>
        <p>Find notes, past papers, and assignments by subject or semester</p>
      </motion.div>

      <motion.div
        className="browse-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <form className="search-box" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input-field search-input"
            placeholder="Search by title, subject, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="filter-group">
          <select name="subject" className="input-field filter-select" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            <option value="Data Structures">Data Structures</option>
            <option value="DBMS">DBMS</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Digital Electronics">Digital Electronics</option>
            <option value="OOP">OOP</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Web Development">Web Development</option>
          </select>
          <select name="semester" className="input-field filter-select" value={filters.semester} onChange={handleFilterChange}>
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Semester {n}</option>)}
          </select>
          <select name="type" className="input-field filter-select" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="NOTES">Notes</option>
            <option value="PAST_PAPER">Past Paper</option>
            <option value="REFERENCE_BOOK">Reference Book</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="PROJECT_REPORT">Project Report</option>
          </select>
          <select name="sort" className="input-field filter-select" value={filters.sort} onChange={handleFilterChange}>
            <option value="newest">Newest First</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            className="browse-loading"
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={32} />
            </motion.div>
          </motion.div>
        ) : filteredResources.length > 0 ? (
          <motion.div
            className="browse-grid"
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredResources.map((resource, i) => (
              <ResourceCard key={resource.id} resource={resource} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="browse-empty"
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Filter size={48} className="empty-icon" />
            </motion.div>
            <h3>No resources found</h3>
            <p>Try adjusting your filters or search terms, or be the first to upload!</p>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
