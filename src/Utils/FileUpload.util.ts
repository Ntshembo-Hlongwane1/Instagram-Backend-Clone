import cloudinary from 'cloudinary';
// import { Files } from 'formidable';

const Cloudinary = cloudinary.v2;
Cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

export const cloudinaryImageUploadMethod = async (file: string) => {
  return new Promise(resolve => {
    Cloudinary.uploader.upload(file, (err, res) => {
      if (err) return res.status(500).send('upload image error');
      resolve(res.secure_url);
    });
  });
};
