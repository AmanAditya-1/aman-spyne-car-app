import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import Car from '../models/Car.js'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'car_management' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    uploadStream.end(file.buffer)
  })
}
/**
 * @swagger
 * /api/cars/create:
 *   post:
 *     summary: Create a new car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Car created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags } = req.body
    const imageUploadPromises = req.files.map(file => uploadToCloudinary(file))
    const uploadedImages = await Promise.all(imageUploadPromises)
    
    const car = new Car({
      user: req.user.id,
      title,
      description,
      tags: tags.split(','),
      images: uploadedImages.map(img => ({ url: img.secure_url, public_id: img.public_id }))
    })
    
    await car.save()
    res.status(201).json(car)
  } catch (error) {
    res.status(500).json({ message: 'Error creating car', error: error.message })
  }
})
/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Retrieve cars associated with the authenticated user
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cars for the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the car.
 *                   user:
 *                     type: string
 *                     description: Unique identifier for the user.
 *                   title:
 *                     type: string
 *                     description: Title of the car.
 *                   description:
 *                     type: string
 *                     description: Description of the car.
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Tags associated with the car.
 *                   images:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           description: URL of the image.
 *                         public_id:
 *                           type: string
 *                           description: Public ID of the image.
 *                         id:
 *                           type: string
 *                           description: Unique identifier for the image.
 *       401:
 *         description: Unauthorized. Token missing or invalid.
 *       500:
 *         description: Server error. Could not fetch cars.
 */


router.get('/', authenticateToken, async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user.id })
    res.json(cars)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cars', error: error.message })
  }
})

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get a car by ID
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Car not found
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user.id })
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json(car)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car', error: error.message })
  }
})
/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               existingImages:
 *                 type: string
 *               newImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Car not found
 */
router.put('/:id', authenticateToken, upload.array('newImages', 10), async (req, res) => {
  try {
    const { title, description, tags, existingImages } = req.body
    const car = await Car.findOne({ _id: req.params.id, user: req.user.id })
    if (!car) return res.status(404).json({ message: 'Car not found' })

    car.title = title
    car.description = description
    car.tags = tags.split(',')

    // Handle existing images
    const existingImagesArray = JSON.parse(existingImages)
    const removedImages = car.images.filter(img => !existingImagesArray.some(existImg => existImg.public_id === img.public_id))

    // Remove images from Cloudinary
    for (const img of removedImages) {
      await cloudinary.uploader.destroy(img.public_id)
    }

    car.images = existingImagesArray

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImageUploadPromises = req.files.map(file => uploadToCloudinary(file))
      const uploadedNewImages = await Promise.all(newImageUploadPromises)
      car.images = [...car.images, ...uploadedNewImages.map(img => ({ url: img.secure_url, public_id: img.public_id }))]
    }

    await car.save()
    res.json(car)
  } catch (error) {
    res.status(500).json({ message: 'Error updating car', error: error.message })
  }
})
/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Car not found
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user.id })
    if (!car) return res.status(404).json({ message: 'Car not found' })

    // Delete images from Cloudinary
    for (const img of car.images) {
      await cloudinary.uploader.destroy(img.public_id)
    }

    await car.remove()
    res.json({ message: 'Car deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting car', error: error.message })
  }
})

export default router