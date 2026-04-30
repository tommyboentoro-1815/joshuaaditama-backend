const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await admin.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: admin._id, username }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// One-time route to create the admin account (disable after first use)
router.post('/setup', async (req, res) => {
  try {
    const exists = await Admin.findOne({})
    if (exists) return res.status(403).json({ message: 'Admin already exists' })

    const { username, password } = req.body
    await Admin.create({ username, password })
    res.json({ message: 'Admin created successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
