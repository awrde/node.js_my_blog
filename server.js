const express = require('express')
const postsRouter = require('./routes/posts')
const app = express()

app.set('view engine', 'ejs')

app.use('/posts', postsRouter)

app.get('/', (req, res) => {
    const post = [{
        title: 'test post',
        writer: 'test writer',
        createdAt : Date.now(),
    }]
    res.render('index', { posts: post })
})
app.listen(5000)
