const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('In posts')
})

module.exports = router