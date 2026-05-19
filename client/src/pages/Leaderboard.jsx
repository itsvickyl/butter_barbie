import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Award, User, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { pageTransition } from '../lib/animations'
import './Leaderboard.css'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const tableRef = useRef(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  // GSAP row entrance after data loads
  useEffect(() => {
    if (!loading && leaders.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('.leaderboard-row')
      gsap.fromTo(rows,
        { opacity: 0, x: -30, scale: 0.95 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power3.out',
        }
      )
    }
  }, [loading, leaders])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, department, points, created_at')
        .order('points', { ascending: false })
        .limit(20)

      if (error) throw error
      setLeaders(data || [])
    } catch (err) {
      console.error('Leaderboard fetch error:', err)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <motion.div className="leaderboard-page loading-screen" {...pageTransition}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={32} />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div className="leaderboard-page" {...pageTransition}>
      <motion.div
        className="leaderboard-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          style={{ display: 'inline-block', marginBottom: 12 }}
        >
          <Award size={40} style={{ color: '#ffd700' }} />
        </motion.div>
        <h1>Top Contributors</h1>
        <p>Recognizing the students who share the most knowledge</p>
      </motion.div>

      <motion.div
        className="leaderboard-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        ref={tableRef}
      >
        <div className="leaderboard-table-header">
          <div className="lb-rank">Rank</div>
          <div className="lb-user">Student</div>
          <div className="lb-dept">Department</div>
          <div className="lb-points">Points</div>
        </div>

        {leaders.map((user, index) => {
          const rank = index + 1
          let rankClass = ''
          if (rank === 1) rankClass = 'rank-gold'
          if (rank === 2) rankClass = 'rank-silver'
          if (rank === 3) rankClass = 'rank-bronze'

          return (
            <motion.div
              key={user.id}
              className={`leaderboard-row ${rankClass}`}
              whileHover={{
                backgroundColor: 'rgba(108, 92, 231, 0.06)',
                x: 4,
              }}
              transition={{ duration: 0.2 }}
              style={{ opacity: 0 }} // GSAP will animate this
            >
              <div className="lb-rank">
                {rank <= 3 ? (
                  <motion.div>
                    <Award size={20} className="rank-icon" />
                  </motion.div>
                ) : (
                  `#${rank}`
                )}
              </div>
              <div className="lb-user">
                <div className="lb-avatar">
                  <User size={16} />
                </div>
                <span className="lb-name">{user.name}</span>
              </div>
              <div className="lb-dept">{user.department || '—'}</div>
              <div className="lb-points">
                <span className="points-value">{user.points || 0}</span>
                <span className="points-label">pts</span>
              </div>
            </motion.div>
          )
        })}

        {leaders.length === 0 && (
          <motion.div
            className="lb-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>No contributors yet. Be the first!</p>
          </motion.div>
        )}
      </motion.div>

    </motion.div>
  )
}
