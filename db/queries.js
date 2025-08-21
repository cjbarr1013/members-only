const pool = require('./pool');

async function getAllPosts() {
  const { rows } = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.message,
      p.added,
      COALESCE(cc.comment_count, 0) AS comment_count,
      u.username,
      u.pic_url,
      u.admin
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) cc ON cc.post_id = p.id
    ORDER BY p.id DESC
    `
  );

  return rows;
}

async function getPostById(id) {
  const { rows } = await pool.query(
    `
    SELECT
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
            'pic_url', cu.pic_url,
            'admin', cu.admin
          )
          ORDER BY c.added
        ), '[]'::json
      ) AS post_comments,
      COUNT(c.id) AS comment_count,
      u.username,
      u.pic_url,
      u.admin
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN comments c ON c.post_id = p.id
    LEFT JOIN users cu ON cu.id = c.user_id
    WHERE p.id = $1
    GROUP BY p.title, p.message, p.added, u.username, u.pic_url, u.admin
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
      u.first,
      u.last,
      u.admin,
      u.pic_url,
      u.bio,
      u.loc,
      u.birthday,
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
          ORDER BY p.added
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
          ORDER BY c.added
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
    `SELECT pic_url, bio, loc, birthday FROM users WHERE username = $1`,
    [username]
  );

  return rows[0];
}

async function addUser(first, last, username, hashedPassword, admin) {
  const { rows } = await pool.query(
    `INSERT INTO users (first, last, username, password, admin) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [first, last, username, hashedPassword, admin]
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

async function editUserInfo(id, picUrl, bio, loc, birthday) {
  await pool.query(
    `UPDATE users SET pic_url = ($1), bio = ($2), loc = ($3), birthday = ($4) WHERE id = ($5)`,
    [picUrl, bio, loc, birthday, id]
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
  getPostById,
  getUserByUsername,
  getUserById,
  getUserProfileByUsername,
  getUserInfoByUsername,
  addUser,
  addPost,
  addComment,
  editUserInfo,
  deletePost,
  deleteComment,
};
