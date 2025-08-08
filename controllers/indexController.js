async function indexGet(req, res) {
  res.redirect('view/posts');
}

module.exports = {
  indexGet,
};
