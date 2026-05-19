import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ResourceCard from '../components/ResourceCard'
import { User, Loader, Award, Upload, Download, Bookmark, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { pageTransition } from '../lib/animations'
import './Profile.css'

export default function Profile() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [myUploads, setMyUploads] = useState([])
  const [myDownloads, setMyDownloads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('uploads')
  const statsRef = useRef(null)

  useEffect(() => {
    if (user?.id) fetchProfileData()
  }, [user])

  // GSAP animate stat cards
  useEffect(() => {
    if (!loading && profile && statsRef.current) {
      const cards = statsRef.current.querySelectorAll('.stat-card')
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        }
      )
    }
  }, [loading, profile])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: uploadsData } = await supabase
        .from('resources')
        .select('*, uploader:profiles!uploader_id(id, name, department)')
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false })
      setMyUploads(uploadsData || [])

      const { data: downloadsData } = await supabase
        .from('downloads')
        .select('*, resource:resources(*, uploader:profiles!uploader_id(id, name, department))')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })

      const downloadedResources = downloadsData?.map(d => d.resource).filter(Boolean) || []
      const uniqueDownloads = Array.from(new Map(downloadedResources.map(r => [r.id, r])).values())
      setMyDownloads(uniqueDownloads)
    } catch (error) {
      console.error('Profile fetch error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <motion.div className="profile-page loading-screen" {...pageTransition}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={32} />
        </motion.div>
      </motion.div>
    )
  }

  if (!profile) return null

  return (
    <motion.div className="profile-page" {...pageTransition}>
      {/* Profile Header */}
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="profile-info">
          <motion.div
            className="profile-avatar"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            whileHover={{ scale: 1.08, boxShadow: '0 8px 30px rgba(108, 92, 231, 0.5)' }}
          >
            <User size={40} />
          </motion.div>
          <div className="profile-details">
            <motion.h1
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {profile.name}
            </motion.h1>
            <motion.p
              className="profile-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {profile.department} · {profile.year ? `Year ${profile.year}` : 'Student'}
            </motion.p>
            <motion.p
              className="profile-joined"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </motion.p>
          </div>
        </div>

        <div className="profile-stats" ref={statsRef}>
          <div className="stat-card points-card" style={{ opacity: 0 }}>
            <div className="stat-icon">
              <Award size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{profile.points || 0}</span>
              <span className="stat-label">Points Earned</span>
            </div>
          </div>
          <div className="stat-card" style={{ opacity: 0 }}>
            <div className="stat-icon">
              <Upload size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{myUploads.length}</span>
              <span className="stat-label">Uploads</span>
            </div>
          </div>
          <div className="stat-card" style={{ opacity: 0 }}>
            <div className="stat-icon">
              <Download size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{myDownloads.length}</span>
              <span className="stat-label">Downloads</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="profile-tabs"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {['uploads', 'downloads'].map((tab) => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ color: 'var(--text-primary)' }}
            whileTap={{ scale: 0.95 }}
          >
            {tab === 'uploads' ? 'My Uploads' : 'Download History'}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          className="profile-content"
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'uploads' && (
            <div className="resources-grid">
              {myUploads.length > 0 ? (
                myUploads.map((resource, i) => (
                  <ResourceCard key={resource.id} resource={resource} index={i} />
                ))
              ) : (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Upload size={48} className="empty-icon" />
                  </motion.div>
                  <h3>No uploads yet</h3>
                  <p>Share your first resource to earn +10 points!</p>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'downloads' && (
            <div className="resources-grid">
              {myDownloads.length > 0 ? (
                myDownloads.map((resource, i) => (
                  <ResourceCard key={resource.id} resource={resource} index={i} />
                ))
              ) : (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Download size={48} className="empty-icon" />
                  </motion.div>
                  <h3>No downloads yet</h3>
                  <p>Browse resources to find what you need.</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  )
}
