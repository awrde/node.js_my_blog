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
    res.status(200).send({ token })
    // res.send('welcome')
    return
  }

  res.status(400).send()
})

app.post('/comment', authMiddleware, async (req, res) => {
  const { postComment, articleId } = req.body
  const writer = res.locals.user.nickname

  if (postComment.length === 0) {
    res.send('fail')
  } else {
    const comment = new Comment({
      post: postComment,
      parentId: articleId,
      writer: writer,
    })
    await comment.save()
    res.send('correct')
  }
})

app.delete('/comment', async (req, res) => {
  // const comment = await comment.find(req.body)
  // console.log(req.body)
})

// // 게시물 삭제
// app.delete('/comment', OnlyAuthenticated, async (req, res) => {
//   const board = '' //TODO: 어떤 게시물을 삭제 할 건가요~? 게시물을 특정지을 수 있어야겠어요 -> 지울 수 있는 권한이 있는 사람으로 검색해야겠죠~?
//   if (String(board.writer._id) !== String(req.user._id)) {
//     res.statusCode = 403
//     res.send('권한이 없습니다.')
//     return
//   }
//   await board.delete()
//   res.statusCode = 200
//   res.send()
// })

app.use('/articles', articleRouter)

app.listen(5000)
