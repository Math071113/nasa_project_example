const express = require('express')

// Controllers
const { 
    getAllLaunches,
    addLaunch,
    abortLaunch, 
} = require('../controllers/launches')

const router = express.Router()

router.get('/', getAllLaunches)
router.post('/', addLaunch)
router.delete('/:id', abortLaunch)

module.exports = router