import { verify } from 'jsonwebtoken';
import { MyRequest } from '../Interfaces/Request.interface';
import { Response, NextFunction } from 'express';
import { config } from 'dotenv';
config();

export const Authenticate = (request: MyRequest, response: Response, next: NextFunction) => {
  const token = request.headers['x-auth-token'] as string;

  verify(token, process.env.cookie_secret, (error, token) => {
    if (error) {
      return response.status(401).json({ msg: 'Signup or Login to continue' });
    }

    request.token = token;
    next();
  });
};
