// CREATE TABLE story(
//   owner VARCHAR(100) NOT NULL,
//   media VARCHAR(200) NOT NULL,
//   text VARCHAR(200),
//   timestap TIMESTAMP NOT NULL
// );
import { Schema, model } from 'mongoose';

const storySchema = new Schema({
  owner: {
    type: String,
    required: true,
  },
  media: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: new Date(),
  },
});

export const storyModel = model('story', storySchema);
