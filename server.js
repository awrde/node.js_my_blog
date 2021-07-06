const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
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

  const memberCheck = await User.findOne({
    $and: [{ nickname }, { password }],
  })
  if (memberCheck) {
    const token = jwt.sign(
      { memberCheckId: memberCheck.memberCheckId },
      'mysecretkey'
    )
    // console.log(token)
    res.send({ token })
    // res.send('welcome')
    return
  }

  res.send()
})

router.get('/users/me', authMiddleware, async (req, res) => {
  res.status(400).send({})
})

app.use('/articles', articleRouter)

app.listen(5000)
