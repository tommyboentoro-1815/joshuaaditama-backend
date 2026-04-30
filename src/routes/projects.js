const router = require('express').Router()
const Project = require('../models/Project')
const authMiddleware = require('../middleware/auth')
const cloudinary = require('../utils/cloudinary')

// GET all active projects (public)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ createdAt: -1 })
    res.json(projects)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET all projects including drafts (protected — admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
    res.json(projects)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET single project by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create project (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = await Project.create(req.body)
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update project (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE project (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    // Delete all images from Cloudinary
    const deletePromises = project.images.map(url => {
      const publicId = url.split('/').pop().split('.')[0]
      return cloudinary.uploader.destroy(`joshua_aditama/${publicId}`)
    })
    await Promise.all(deletePromises)

    await project.deleteOne()
    res.json({ message: 'Project deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
