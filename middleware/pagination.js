const db = require('../db/queries');

async function normalizePaginationInfo(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = req.session.limit || 25;
  const sort = req.session.sort || 'desc';
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const { total } = await db.getPostTotal();
    res.pagination = {
      page,
      limit,
      sort,
      startIndex,
      endIndex: endIndex > total ? total : endIndex,
      totalPosts: parseInt(total),
      prev: {
        exists: page - 1 > 0,
        page: page - 1,
      },
      next: {
        exists: endIndex < total,
        page: page + 1,
      },
    };
  } catch (err) {
    next(err);
  }

  next();
}

module.exports = {
  normalizePaginationInfo,
};
