const express = require('express')
const postsRouter = require('./routes/posts')
const app = express()

app.set('view engine', 'ejs')

app.use('/posts', postsRouter)

app.get('/', (req, res) => {
    res.render('index')
})
app.listen(5000)
