import { Request, Response } from 'express';
import { File, IncomingForm } from 'formidable';
import { config } from 'dotenv';
import { MyRequest } from '../Interfaces/Request.interface';
import { cloudinaryImageUploadMethod } from '../Utils/FileUpload.util';
import { pool } from '../Config/Database.config';
config();

interface Post {
  create(request: MyRequest, response: Response): void;
}

export class PostController implements Post {
  create(request: any, response: Response) {
    const form = new IncomingForm();
    form.parse(request, async (error, fields, files) => {
      if (error) {
        return response.status(500).json({ msg: 'Network Error: Failed to upload post' });
      }

      const token = request.token;
      const author = token.username;
      const { caption } = fields;

      const media_count = Object.keys(files).length;
      const media_keys = Object.keys(files);
      const media_urls = [];
      for (let i = 0; i < media_count; i++) {
        const file = (files[media_keys[i]] as File).path;
        const file_url = await cloudinaryImageUploadMethod(file);
        media_urls.push(file_url);
      }

      const query = 'INSERT INTO posts (media, caption, author) VALUES ($1, $2, $3)';
      pool
        .query(query, [media_urls, caption, author])
        .then(() => {
          return response.status(201).json({ msg: 'Post made' });
        })
        .catch(error => {
          return response.status(500).json(error);
        });
    });
  }

  async getPosts(request: Request, response: Response) {
    // const query = 'SELECT * FROM posts INNER JOIN users ON posts.author = users.username';
    const query =
      'SELECT posts.id,posts.media,posts.caption,posts.likes,posts.comments,users.username FROM posts INNER JOIN users ON posts.author = users.username';
    const data = (await pool.query(query)).rows;
    return response.status(200).json(data);
  }

  async like(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const post_id = request.params.id;

    let query = 'SELECT * FROM posts WHERE posts.id=$1';
    const data = (await pool.query(query, [post_id])).rows[0];

    if (!data.likes) {
      const likes = [username];
      query = 'UPDATE posts SET likes=$1 WHERE posts.id=$2';
      pool
        .query(query, [likes, post_id])
        .then(() => {
          return response.status(200).json({ msg: `Liked post succesfully` });
        })
        .catch(error => {
          return response.status(500).json(error);
        });
    } else if (!data.likes.includes(username)) {
      const likes = [...data.likes, username];
      query = 'UPDATE posts SET likes=$1 WHERE posts.id=$2';
      pool
        .query(query, [likes, post_id])
        .then(() => {
          return response.status(200).json({ msg: `Liked post succesfully` });
        })
        .catch(error => {
          return response.status(500).json(error);
        });
    } else {
      return response.status(200).json({ msg: 'Already liked' });
    }
  }

  async comment(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const { comment } = request.body;
    const post_id = request.params.id;

    console.log('COmment', comment);
    let query = 'SELECT * FROM posts WHERE posts.id=$1';
    const data = (await pool.query(query, [post_id])).rows[0];

    if (!data.comments) {
      const newComment = {
        username,
        comment: comment,
        likes: 0,
        replies: [],
      };

      query = 'UPDATE posts SET comments=$1 WHERE posts.id=$2';
      pool
        .query(query, [JSON.stringify([newComment]), post_id])
        .then(() => {
          return response.status(200).json({ msg: 'Comment made' });
        })
        .catch(error => {
          return response.status(500).json(error);
        });
    } else {
      const newComment = {
        username,
        comment: comment,
        likes: [],
        replies: [],
      };
      const updatedComments = JSON.stringify([...data.comments, newComment]);
      query = 'UPDATE posts SET comments=$1 WHERE posts.id=$2';
      pool
        .query(query, [updatedComments, post_id])
        .then(() => {
          return response.status(200).json({ msg: 'Comment made' });
        })
        .catch(error => {
          return response.status(500).json(error);
        });
    }
  }

  async replyComment(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const replyTo = request.params.username;
    const post_id = request.params.id;
    const commentIdx = request.params.idx;
    const { reply } = request.body;

    let query = 'SELECT * FROM posts WHERE posts.id=$1';
    const post = (await pool.query(query, [post_id])).rows[0];
    const comments = [...post.comments];
    comments[commentIdx].replies.push({ username, reply });

    query = 'UPDATE posts SET comments=$1 WHERE posts.id=$2';
    pool
      .query(query, [JSON.stringify(comments), post_id])
      .then(() => {
        return response.status(200).json({ msg: 'Replied to comment' });
      })
      .catch(error => {
        return response.status(500).json(error);
      });

    // return response.status(200).json({ id: comments, commentIdx });
  }

  async getPostById(request: Request, response: Response) {
    const post_id = request.params.id;
    const query = 'SELECT * FROM posts WHERE posts.id=$1';

    const post = (await pool.query(query, [post_id])).rows;
    return response.status(200).json(post);
  }
}
