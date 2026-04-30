const router = require('express').Router()
const multer = require('multer')
const cloudinary = require('../utils/cloudinary')
const authMiddleware = require('../middleware/auth')

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  }
})

// Upload multiple images (protected)
router.post('/', authMiddleware, upload.array('images', 20), async (req, res) => {
  try {
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'joshua_aditama', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result.secure_url)
          }
        )
        stream.end(file.buffer)
      })
    })

    const urls = await Promise.all(uploadPromises)
    res.json({ urls })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a single image from Cloudinary (protected)
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body
    const publicId = 'joshua_aditama/' + url.split('/').slice(-1)[0].split('.')[0]
    await cloudinary.uploader.destroy(publicId)
    res.json({ message: 'Image deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
