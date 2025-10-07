const pool = require('./pool');

async function getAllPosts(startIndex, limit, sort) {
  const sortSQL = {
    desc: 'p.id DESC',
    asc: 'p.id ASC',
    'cc-desc': 'comment_count DESC, p.id DESC',
    'cc-asc': 'comment_count ASC, p.id ASC',
  };
  const orderClause = sortSQL[sort] || sortSQL.desc;

  const { rows } = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.message,
      p.added,
      COALESCE(cc.comment_count, 0) AS comment_count,
      u.username,
      u.has_pic,
      u.pic_version,
      u.admin
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) cc ON cc.post_id = p.id
    ORDER BY ${orderClause}
    LIMIT $2 OFFSET $1
    `,
    [startIndex, limit]
  );

  return rows;
}

async function getPostTotal() {
  const { rows } = await pool.query('SELECT COUNT(*) AS total FROM posts');

  return rows[0];
}

async function getPostById(id) {
  const { rows } = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.message,
      p.added,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', c.id,
            'message', c.message,
            'added', c.added,
            'username', cu.username,
            'has_pic', cu.has_pic,
            'pic_version', cu.pic_version,
            'admin', cu.admin
          )
          ORDER BY c.id DESC
        ) FILTER (WHERE c.id IS NOT NULL), 
        '[]'::json
      ) AS post_comments,
      COUNT(c.id) AS comment_count,
      u.username,
      u.has_pic,
      u.pic_version,
      u.admin
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN comments c ON c.post_id = p.id
    LEFT JOIN users cu ON cu.id = c.user_id
    WHERE p.id = $1
    GROUP BY p.id, p.title, p.message, p.added, u.username, u.has_pic, u.pic_version, u.admin
    `,
    [id]
  );

  return rows[0];
}

async function getUserByUsername(username) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);

  return rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

  return rows[0];
}

async function getUserProfileByUsername(username) {
  const { rows } = await pool.query(
    `
    SELECT
      JSON_BUILD_OBJECT(
        'username', u.username,
        'first', u.first,
        'last', u.last,
        'admin', u.admin,
        'has_pic', u.has_pic,
        'pic_version', u.pic_version,
        'bio', u.bio,
        'loc', u.loc,
        'birthday', u.birthday
      ) AS info,
      COALESCE(posts_agg.posts, '[]'::json) AS posts,
      COALESCE(comments_agg.comments, '[]'::json) AS comments,
      COALESCE(comments_agg.comment_count, 0) AS comment_count,
      COALESCE(posts_agg.post_count, 0) AS post_count
    FROM users u
    LEFT JOIN LATERAL (
      SELECT
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', p.id,
            'title', p.title,
            'message', p.message,
            'added', p.added,
            'comment_count', COALESCE(cc.comment_count, 0)
          )
          ORDER BY p.id DESC
        ) AS posts,
        COUNT(*) AS post_count
      FROM posts p
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
      ) cc ON cc.post_id = p.id
      WHERE p.user_id = u.id
    ) posts_agg ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', c.id,
            'message', c.message,
            'added', c.added,
            'post_id', c.post_id,
            'post_title', p.title
          )
          ORDER BY c.id DESC
        ) AS comments,
        COUNT(*) AS comment_count
      FROM comments c
      INNER JOIN posts p ON p.id = c.post_id
      WHERE c.user_id = u.id
    ) comments_agg ON TRUE
    WHERE u.username = $1
    `,
    [username]
  );

  return rows[0];
}

async function getUserInfoByUsername(username) {
  const { rows } = await pool.query(
    `SELECT has_pic, pic_version, bio, loc, birthday FROM users WHERE username = $1`,
    [username]
  );

  return rows[0];
}

async function getCommentById(id) {
  const { rows } = await pool.query(`SELECT * FROM comments WHERE id = $1`, [
    id,
  ]);

  return rows[0];
}

async function addUser(first, last, username, hashedPassword, admin) {
  const { rows } = await pool.query(
    `INSERT INTO users (first, last, username, password, admin) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [first, last, username, hashedPassword, admin]
  );

  return rows[0];
}

async function addUserInfo(id, admin, hasPic, picVersion, bio, loc, birthday) {
  const { rows } = await pool.query(
    `UPDATE users SET admin = ($2), has_pic = ($3), pic_version = ($4), bio = ($5), loc = ($6), birthday = ($7) WHERE id = ($1)`,
    [id, admin, hasPic, picVersion, bio, loc, birthday]
  );

  return rows[0];
}

async function addPost(title, message, userId) {
  await pool.query(
    `INSERT INTO posts (title, message, user_id) VALUES ($1, $2, $3)`,
    [title, message, userId]
  );
}

async function addComment(message, postId, userId) {
  await pool.query(
    `INSERT INTO comments (message, post_id, user_id) VALUES ($1, $2, $3)`,
    [message, postId, userId]
  );
}

async function editUserInfo(
  id,
  first,
  last,
  admin,
  hasPic,
  picVersion,
  bio,
  loc,
  birthday
) {
  await pool.query(
    `UPDATE users SET first = ($2), last = ($3), admin = ($4), has_pic = ($5), pic_version = ($6), bio = ($7), loc = ($8), birthday = ($9) WHERE id = ($1)`,
    [id, first, last, admin, hasPic, picVersion, bio, loc, birthday]
  );
}

async function deletePost(id) {
  await pool.query(`DELETE FROM posts WHERE id = ($1)`, [id]);
}

async function deleteComment(id) {
  await pool.query(`DELETE FROM comments WHERE id = ($1)`, [id]);
}

module.exports = {
  getAllPosts,
  getPostTotal,
  getPostById,
  getUserByUsername,
  getUserById,
  getUserProfileByUsername,
  getUserInfoByUsername,
  getCommentById,
  addUser,
  addUserInfo,
  addPost,
  addComment,
  editUserInfo,
  deletePost,
  deleteComment,
};
