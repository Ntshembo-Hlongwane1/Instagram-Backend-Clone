import { Router } from 'express';
import { PostController } from '../Controller/Post.controller';
import { Authenticate } from '../Middleware/Authenticate.middleware';
import { json } from 'body-parser';

const router = Router();
const Controller = new PostController();

router.post('/api/post', json(), Authenticate, (request, response) => {
  Controller.create(request, response);
});

router.get('/api/post', (request, response) => {
  Controller.getPosts(request, response);
});

router.get('/api/post-like/:id', Authenticate, (request, response) => {
  Controller.like(request, response);
});

router.post('/api/post-comment/:id', json(), Authenticate, (request, response) => {
  Controller.comment(request, response);
});

router.post('/api/post-reply-comment/:username/:id/:idx', json(), Authenticate, (request, response) => {
  Controller.replyComment(request, response);
});

router.get('/api/post/:id', (request, response) => {
  Controller.getPostById(request, response);
});
export default router;
