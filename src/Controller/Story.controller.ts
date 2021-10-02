import { Response } from 'express';
import CronJob from 'cron';
import { IncomingForm } from 'formidable';
import { cloudinaryImageUploadMethod } from '../Utils/FileUpload.util';
import { storyModel } from '../Models/Story.model';

const Cron = CronJob.CronJob;
export const job = new Cron(
  '* * * * * *',
  async () => {
    const data = await storyModel.find();

    //The subtraction returns the difference between the two dates in milliseconds. 36e5 is the scientific notation for 60*60*1000, dividing by which converts the milliseconds difference into hours.
    data.forEach((doc: any, idx) => {
      const currentDate: any = new Date();
      const hours = Math.abs(currentDate - doc.timestamp) / 36e5;

      if (hours >= 24) {
        storyModel
          .findOneAndDelete({ _id: doc._id })
          .then(() => {
            console.log('Story Deleted');
          })
          .catch(error => {
            console.log(`Failed to delete story`, error);
          });
      }
    });
  },
  null,
  true,
  'America/Los_Angeles',
);

export class StoryController {
  create(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const form = new IncomingForm();

    form.parse(request, async (error, fields, files: any) => {
      if (error) {
        return response.status(500).json(error);
      }

      const { text } = fields;
      const { backgroundMedia } = files;

      const media_url = await cloudinaryImageUploadMethod(backgroundMedia.path);

      const newStory = new storyModel({
        owner: username,
        media: media_url,
        text,
      });

      try {
        const savedStory = await newStory.save();
        return response.status(201).json({ msg: 'Story added', savedStory });
      } catch (error) {
        return response.status(500).json(error);
      }
    });
  }
}
