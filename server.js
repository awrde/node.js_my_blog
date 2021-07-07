const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const Comment = require('./models/comment')
const User = require('./models/user')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const app = express()
const authMiddleware = require('./middlewares/auth-middleware')
const jwt = require('jsonwebtoken')
const router = require('./routes/articles')

mongoose.connect('mongodb://test:test@localhost:27017/admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

app.get('/signUp', (req, res) => {
  res.render('articles/sign_up')
})

app.post('/signUp', async (req, res) => {
  const { nickname, password, confirmPassword } = req.body

  if (password !== confirmPassword) {
    res.send('false_password')
    return
  }

  const exisUsers = await User.find({ nickname })
  if (exisUsers.length) {
    res.send('false_nickname')
    return
  }

  const user = new User({ nickname, password })
  await user.save()

  res.send('correct')
})

app.get('/auth', (req, res) => {
  res.render('articles/sign_in')
})

app.post('/auth', async (req, res) => {
  const { nickname, password } = req.body

  const user = await User.findOne({
    $and: [{ nickname }, { password }],
  })
  if (user) {
    const token = jwt.sign({ userId: user.userId }, 'my-secret-key')
    console.log('토큰 값:', token)
    res.status(200).send({ token })
    // res.send('welcome')
    return
  }

  res.status(400).send()
})

app.post('/comment', async (req, res) => {
  const { post } = req.body
  console.log(post)

  const comment = new Comment({ post })
  await comment.save()
})

app.use('/articles', articleRouter)

app.listen(5000)
