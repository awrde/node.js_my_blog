const express = require('express')
const Article = require('./../models/article')
const Comment = require('./../models/comment')
const router = express.Router()
const authMiddleware = require('../middlewares/auth-middleware')

router.get('/new', (req, res) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

router.put('/edit/', async (req, res) => {
  password = req.body[`password`]
  _id = req.body[`_id`]
  title = req.body[`title`]
  description = req.body[`description`]
  writer = req.body[`writer`]
  find = await Article.findOne({ _id: _id, password: password })
  if (find != null) {
    await Article.updateOne({ _id }, { $set: { title, description, writer } })
    res.send('correct')
  } else {
    res.send('false')
  }
})

router.delete('/edit', authMiddleware, async (req, res) => {
  console.log(res.locals)
  password = req.body.password
  _id = req.body._id
  find = await Article.findOne({ _id: _id, password: password })
  console.log(find)
  if (find != null) {
    await Article.findByIdAndDelete(_id)
    res.send('correct')
  } else {
    res.send('wrong')
  }
})

router.get('/:id', async (req, res) => {
  const article = await Article.findOne({ _id: req.params.id })
  const comment = await Comment.find({ parentId: req.params.id }).sort({
    createdAt: 'desc',
  })
  // console.log(comment)
  if (article == null) {
    res.redirect('/')
  }

  res.render('articles/show', { article: article, comment: comment })
})

router.post('/', function (req, res) {
  let article = new Article()
  article.title = req.body.title
  article.description = req.body.description
  article.writer = req.body.writer
  article.password = req.body.password
  article.save(function (err) {
    if (err) {
      console.error(err)
      res.json({ result: '에러 발생' })
      return
    }
    res.redirect('/')
  })
})

//댓글 삭제하기
router.get('/comment/:id', async (req, res) => {
  targetComment = await Comment.findById(req.params.id)
  targetArticle = await Article.findById(targetComment.parentId)
  await Comment.findByIdAndDelete(targetComment)
  res.redirect(`/articles/${targetArticle.id}`)
})

router.get('/comment/edit/:id', async (req, res) => {
  targetComment = await Comment.findById(req.params.id)
  targetArticle = await Article.findById(targetComment.parentId)
  res.render(`articles/post_comment`, {
    comment: targetComment,
    article: targetArticle,
  })
})

router.put('/comment/edit/:id', async (req, res) => {
  articleId = req.body.article
  comment = req.body.comment
  console.log(comment)
  // find = await Comment.findOne({ _id: comment.id })
  // console.log(find)
})

router.put(
  '/:id',
  async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
  },
  saveArticleAndRedirect('edit')
)

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.writer = req.body.writer
    article.password = req.body.password
    try {
      article = await article.save()
      res.redirect(`/articles/${article.id}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router
