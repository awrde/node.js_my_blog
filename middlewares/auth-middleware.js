module.exports = (req, res, next) => {
  //   console.log('head', req.headers)
  //   console.log('body', req.body)
  const { authorization } = req.headers
  console.log(authorization)

  next()
}
