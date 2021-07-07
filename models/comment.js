const mongoose = require('mongoose')
// const Article = require('/article')

const commentSchema = new mongoose.Schema({
  //article._id에 해당하는 댓글만 띄워야함.
  // articleId: Article._id,
  parentId: String,
  post: String,
  writer: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})
module.exports = mongoose.model('Comment', commentSchema)
