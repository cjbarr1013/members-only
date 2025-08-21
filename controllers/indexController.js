async function indexGet(req, res) {
  return res.redirect('/view/posts');
}

module.exports = {
  indexGet,
};
