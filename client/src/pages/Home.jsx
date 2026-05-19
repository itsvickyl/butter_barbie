import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Upload, Download, ArrowRight, BookOpen, FileText, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fadeInUp, staggerContainer, staggerItem, pageTransition } from '../lib/animations'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

function AnimatedCounter({ target, suffix = '' }) {
  const counterRef = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = counterRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const num = parseInt(target.replace(/[^0-9]/g, ''))
          gsap.fromTo(el, { innerText: 0 }, {
            innerText: num,
            duration: 2.2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () {
              el.textContent = Math.ceil(parseFloat(el.textContent)).toLocaleString() + suffix
            },
          })
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, suffix])

  return <span ref={counterRef}>0{suffix}</span>
}

export default function Home() {
  const { isAuthenticated } = useAuth()
  const heroRef = useRef(null)
  const particlesRef = useRef(null)

  // GSAP floating particles background
  useEffect(() => {
    const container = particlesRef.current
    if (!container) return

    const particles = []
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div')
      particle.className = 'hero-particle'
      const size = Math.random() * 4 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.opacity = `${Math.random() * 0.4 + 0.1}`
      container.appendChild(particle)
      particles.push(particle)

      gsap.to(particle, {
        y: `${-60 - Math.random() * 80}`,
        x: `${(Math.random() - 0.5) * 60}`,
        opacity: 0,
        duration: 3 + Math.random() * 4,
        repeat: -1,
        delay: Math.random() * 3,
        ease: 'power1.out',
        onRepeat: () => {
          gsap.set(particle, {
            left: `${Math.random() * 100}%`,
            top: `${70 + Math.random() * 30}%`,
            opacity: Math.random() * 0.4 + 0.1,
          })
        },
      })
    }

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [])

  // GSAP parallax on hero section
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Feature cards scroll animation
      gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Stats scroll animation
      gsap.utils.toArray('.stat-block').forEach((block, i) => {
        gsap.fromTo(block,
          { opacity: 0, scale: 0.8, y: 30 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: block,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // CTA card scroll animation
      gsap.fromTo('.cta-card',
        { opacity: 0, scale: 0.92, y: 40 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  const featureCards = [
    { icon: Upload, title: 'Upload Resources', desc: 'Share your notes, past papers, and assignments with the campus community.', color: '' },
    { icon: Search, title: 'Search and Filter', desc: 'Find exactly what you need by subject, semester, type, or keyword.', color: 'icon-teal' },
    { icon: Download, title: 'Download Instantly', desc: 'Access resources with a single click. No sign-ups, no paywalls for downloads.', color: 'icon-amber' },
  ]

  return (
    <motion.div className="home-page" {...pageTransition}>
      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hero-particles" ref={particlesRef} />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <span>Built for Yugastra -- Ramaiah University</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Your campus resources,
            <br />
            <motion.span
              className="gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              all in one place.
            </motion.span>
          </motion.h1>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            CampusShare is a community-driven platform where students upload, discover,
            and download academic resources — notes, past papers, assignments, and more.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/browse" className="btn-primary hero-btn">
                Browse Resources
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            {!isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="btn-ghost hero-btn">
                  Get Started
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-grid">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              className="feature-card"
              whileHover={{
                y: -8,
                boxShadow: '0 0 40px rgba(108, 92, 231, 0.2)',
                borderColor: 'rgba(108, 92, 231, 0.4)',
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`feature-icon ${card.color}`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <card.icon size={24} />
              </motion.div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { icon: FileText, number: '500', suffix: '+', text: 'Resources Shared' },
            { icon: Users, number: '200', suffix: '+', text: 'Active Students' },
            { icon: BookOpen, number: '50', suffix: '+', text: 'Subjects Covered' },
            { icon: Download, number: '2000', suffix: '+', text: 'Downloads' },
          ].map((stat, i) => (
            <div key={stat.text} className="stat-block">
              <motion.div whileHover={{ scale: 1.2 }} transition={{ type: 'spring' }}>
                <stat.icon size={28} className="stat-icon" />
              </motion.div>
              <span className="stat-number">
                <AnimatedCounter target={stat.number} suffix={stat.suffix} />
              </span>
              <span className="stat-text">{stat.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to contribute?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join the community and start sharing your academic resources today.
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={isAuthenticated ? '/upload' : '/register'}
              className="btn-primary hero-btn"
            >
              {isAuthenticated ? 'Upload a Resource' : 'Create Account'}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

    </motion.div>
  )
}
