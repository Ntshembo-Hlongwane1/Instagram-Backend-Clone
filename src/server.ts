import express, { response } from 'express';
import AuthRoutes from './Routes/Auth.routes';
import PostRoutes from './Routes/Post.routes';
import StoryRoutes from './Routes/Story.routes';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import { job } from './Controller/Story.controller';
config();

const server = express();
const mongoURI = process.env.mongoURI;

connect(mongoURI, error => {
  if (error) {
    return console.log(`Server Failed to connect to MongoDB`);
  }
  console.log(`Server connected to MongoDB`);
});

server.use(AuthRoutes);
server.use(PostRoutes);
server.use(StoryRoutes);

job.start();
const PORT = process.env.PORT ?? 5000;
server.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
