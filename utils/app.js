import express from 'express';
import cors from 'cors';
import { ORIGIN } from '../constants/index.js';

// initialize app
const app = express();

// middlewares
app.use(cors({ origin: ORIGIN }));
app.use(express.json()); // body parser
app.use(express.urlencoded({ extended: false })); // url parser

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send();
  next();
});

export default app;
