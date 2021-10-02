import { Router } from 'express';
import { StoryController } from '../Controller/Story.controller';
import { Authenticate } from '../Middleware/Authenticate.middleware';

const router = Router();
const Controller = new StoryController();

router.post('/api/story', Authenticate, (request, response) => {
  Controller.create(request, response);
});

export default router;
