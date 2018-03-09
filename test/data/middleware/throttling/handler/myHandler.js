module.exports = function (request, response, next) {
      response.status(429).json({ error: 'Too many requests, please try again later.' });
  };