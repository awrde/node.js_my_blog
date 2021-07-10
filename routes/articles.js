const express = require('express')
const Article = require('./../models/article')
const Comment = require('./../models/comment')
const router = express.Router()
const authMiddleware = require('../middlewares/auth-middleware')
// const comment = require('./../models/comment')
const { clearCache } = require('ejs')

router.get('/new', (req, res) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

router.put('/edit/', authMiddleware, async (req, res) => {
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
  password = req.body.password
  _id = req.body._id
  find = await Article.findOne({ _id: _id, password: password })
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
  if (article == null) {
    res.redirect('/')
  }
  console.log(comment)
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
router.delete('/comment/', authMiddleware, async (req, res) => {
  a = targetComment = await comment.findById(req.body.commentId)
  if (targetComment.writer === res.locals.user.nickname) {
    await Comment.findByIdAndDelete(req.body.commentId)
    res.send('success')
  } else {
    res.send('false')
  }
})

router.get('/comment/edit/:id', async (req, res) => {
  targetComment = await Comment.findById(req.params.id)
  targetArticle = await Article.findById(targetComment.parentId)
  res.render(`articles/post_comment`, {
    comment: targetComment,
    article: targetArticle,
  })
})

router.put('/comment/edit/:id', authMiddleware, async (req, res) => {
  commentUpdate = req.body.commentEdit
  const nickname = res.locals.user.nickname
  d = req.body.comment.split(',')
  e = d[0].split(' ')
  commentId = e[3]
  find = await Comment.findOne({ _id: commentId })

  if (nickname != find.writer) {
    res.send('댓글 작성자가 다르다!')
    return
  }

  if (commentUpdate.length !== 0) {
    find = await Comment.findOne({ _id: commentId })
    await find.update({ post: commentUpdate })
    res.status(200).send('수정 완료!')
    return
  }

  res.send('내용을 추가해!')
})

router.put(
  '/:id',
  async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
  },
  saveArticleAndRedirect('edit')
)

router.get('/comment/asd', authMiddleware, async (req, res) => {
  userNickname = res.locals.user.nickname
  const { postId } = req.query
  console.log('유저Id', userNickname)
  console.log(postId)
  const comments = await Comment.find({ parentId: postId })
  console.log(comments)
  res.send({ userNickname, comments })
})

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
