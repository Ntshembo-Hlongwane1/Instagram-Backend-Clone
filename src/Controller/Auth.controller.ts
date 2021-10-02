import { Request, Response } from 'express';
import { pool } from '../Config/Database.config';
import { genSalt, hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { config } from 'dotenv';
config();

interface Auth {
  signup(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
  signin(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

export class AuthController implements Auth {
  async signup(request: Request, response: Response) {
    const { username, email, password, fullname, bio } = request.body;

    if (!username || !email || !password || !fullname || !bio) {
      return response.status(400).json({ msg: 'All fields are required' });
    }

    const query = 'INSERT INTO users (username, email, password, fullname, bio) VALUES ($1, $2, $3, $4, $5)';

    const salt = await genSalt(18);
    const hashedPassword = await hash(password, salt);
    pool
      .query(query, [username, email, hashedPassword, fullname, bio])
      .then(() => {
        return response.status(201).json({ msg: 'Account created succesfully' });
      })
      .catch(error => {
        return response.status(500).json(error);
      });
  }

  async signin(request: Request, response: Response) {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ msg: 'All fields are required' });
    }

    const query = 'SELECT * FROM users WHERE email=$1';
    const user = await (await pool.query(query, [email])).rows[0];

    if (!user) {
      return response.status(404).json({ msg: 'Accout with this email does not exist' });
    }

    const hashedPassword = user.password;
    const isPasswordValid = await compare(password, hashedPassword);

    if (!isPasswordValid) {
      return response.status(400).json({ msg: 'Invalid password' });
    }
    const token_payload = {
      username: user.username,
      email: user.email,
    };
    const token = sign(token_payload, process.env.cookie_secret, { expiresIn: '365d' });
    return response.status(200).json({ token });
  }
}
