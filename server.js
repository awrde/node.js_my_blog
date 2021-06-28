const express = require('express')
const postsRouter = require('./routes/posts')
const app = express()

app.set('view engine', 'ejs')

app.use('/posts', postsRouter)

app.get('/', (req, res) => {
    const posts = [{
        title: 'test post',
        writer: 'test writer',
        createdAt : new Date(),
    },
    {
        title: 'test post2',
        writer: 'test writer2',
        createdAt : new Date(),
    }]
    res.render('index', { posts: posts })
})
app.listen(5000)
