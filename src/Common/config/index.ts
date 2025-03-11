import { HttpServer } from '../../server/HttpServer';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.PORT) {
    throw new Error('PORT variable is not defined.');
  }

const port = parseInt(process.env.PORT, 10);

const server = new HttpServer(port);

// Start the server
server.start();