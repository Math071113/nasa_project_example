const express = require('express')

// Router files
const planetsRouter = require('./planets')
const launchesRouter = require('./launches')

const router = express.Router()

router.use('/planets', planetsRouter)
router.use('/launches', launchesRouter)

module.exports = router