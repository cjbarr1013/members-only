const app = require('../../app');
const db = require('../../db/queries');
const { registerAndLogin } = require('../helpers/auth');

describe('deleteRouter', () => {
  describe('POST /post/:id route', () => {
    it('deletes post and redirects to home if authorized as admin', async () => {
      const { agent } = await registerAndLogin(app, true);
      const postsBefore = await db.getAllPosts();
      expect(postsBefore.length).toBeGreaterThan(0);
      const target = postsBefore[0]; // delete the most recent

      const res = await agent
        .post(`/delete/post/${target.id}`)
        .type('form')
        .send();
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/');

      const postAfter = await db.getPostById(target.id);
      expect(postAfter).toBeFalsy();
    });

    it('does not delete post and returns 401 if not admin', async () => {
      const { agent } = await registerAndLogin(app, false);
      const postsBefore = await db.getAllPosts();
      expect(postsBefore.length).toBeGreaterThan(0);
      const target = postsBefore[0];

      const res = await agent
        .post(`/delete/post/${target.id}`)
        .type('form')
        .send();
      expect(res.statusCode).toBe(401);

      // Ensure it was not deleted
      const postAfter = await db.getPostById(target.id);
      expect(postAfter).toBeTruthy();
    });
  });

  describe('POST /comment/:commentId/:postId route', () => {
    it('deletes comment and redirects to /view/posts/:postId if authorized as admin', async () => {
      const { agent } = await registerAndLogin(app, true);

      const posts = await db.getAllPosts();
      const postWithComments = posts.find((p) => p.comment_count > 0);
      expect(postWithComments).toBeTruthy();

      const postDetails = await db.getPostById(postWithComments.id);
      const comment = postDetails.post_comments[0];

      const res = await agent
        .post(`/delete/comment/${comment.id}/${postWithComments.id}`)
        .type('form')
        .send();
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe(`/view/posts/${postWithComments.id}`);

      // verify comment removed
      const after = await db.getCommentById(comment.id);
      expect(after).toBeFalsy();
    });

    it('does not delete comment and returns 401 if not admin', async () => {
      const { agent } = await registerAndLogin(app, false);

      const posts = await db.getAllPosts();
      const postWithComments = posts.find((p) => p.comment_count > 0);
      expect(postWithComments).toBeTruthy();

      const postDetails = await db.getPostById(postWithComments.id);
      const comment = postDetails.post_comments[0];

      const res = await agent
        .post(`/delete/comment/${comment.id}/${postWithComments.id}`)
        .type('form')
        .send();
      expect(res.statusCode).toBe(401);

      // verify comment not removed
      const after = await db.getCommentById(comment.id);
      expect(after).toBeTruthy();
    });
  });
});
