const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = (req, res, next) => {
  const { authorization } = req.headers
  const [tokenType, tokenValue] = authorization.split(' ')
  console.log('미들웨어 토큰이 정상적으로 들어온다.', tokenType, tokenValue)
  if (tokenType !== 'Bearer') {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요',
    })
    return
  }

  try {
    const { userId } = jwt.verify(tokenValue, 'my-secret-key')

    User.findById(userId).then((user) => {
      res.locals.user = user // 이 미들웨어를 사용하는 다른곳에서도 공통적으로 사용할 수 있어서 편리하다.
      next()
    })
  } catch (error) {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요',
    })
    return
  }
}
