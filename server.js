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
const { findById, findOne } = require('./models/article')

mongoose.connect('mongodb://test:test@localhost:27017/admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})

app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

app.get('/signUp', authMiddleware, async (req, res) => {
  res.send()
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
    res.status(200).send({ token })
    // res.send('welcome')
    return
  }

  res.status(400).send()
})

app.post('/comment', authMiddleware, async (req, res) => {
  const { postComment, articleId } = req.body
  const writer = res.locals.user.nickname
  console.log(res.locals.user)
  // if (writer === ) {
  //   res.status(200).send('로그인 필요')
  // }

  if (postComment.length === 0) {
    res.send('fail')
    return
  }
  const comment = new Comment({
    post: postComment,
    parentId: articleId,
    writer: writer,
  })
  await comment.save()
  res.send('correct')

  // try {
  //   res.send('로그인 부탁해!')
  // } catch (err) {
  //   res.send('로그인 부탁해!')
  // }
  // try {
  //   article = await article.save()
  //   res.redirect(`/articles/${article.id}`)
  // } catch (e) {
  //   res.render(`articles/${path}`, { article: article })
  // }
})

app.use('/articles', articleRouter)

app.listen(5000)
