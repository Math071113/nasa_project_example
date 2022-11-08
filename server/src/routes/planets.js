const express = require('express')

// Controllers
const { getAllPlanets } = require('../controllers/planets.js')

const router = express.Router()

router.get('/', getAllPlanets)

module.exports = router