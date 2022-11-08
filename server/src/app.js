const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')

const app = express()

// router - API versions
const v1 = require('./routes/api')

app.use(cors({
    origin:'http://localhost:3000'
}))

app.use(morgan('combined'))

app.use(express.json())

// serving build folder obtained by running build script in CRA
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/v1', v1)

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app