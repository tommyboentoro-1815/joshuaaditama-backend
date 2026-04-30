const express = require('express')
const mongoose = require('mongoose')
const cloudinary = require('../utils/cloudinary')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const [dbStats, cloudinaryUsage] = await Promise.all([
      mongoose.connection.db.stats(),
      cloudinary.api.usage(),
    ])

    const CLOUDINARY_FREE_LIMIT = 25 * 1024 * 1024 * 1024 // 25 GB

    res.json({
      mongodb: {
        usedBytes: dbStats.dataSize + dbStats.indexSize,
        limitBytes: 512 * 1024 * 1024,
      },
      cloudinary: {
        usedBytes: cloudinaryUsage.storage.usage,
        limitBytes: cloudinaryUsage.storage.limit || CLOUDINARY_FREE_LIMIT,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
