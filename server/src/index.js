import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from 'morgan';
import initData from './data';
import routes from './routes';
import joiErrors from './middlewares/joiErrors';
import { error404 } from './middlewares/responseErrors';
import { welcomeMessage } from './htmlMessage/index';

initData(); // Initialise global data arrays
dotenv.config(); // Sets environment's varibles

const urlPrefixV1 = '/api/v1'; // Url prefix to map all urls
const app = express();
const { PORT = 3000, NODE_ENV } = process.env;

// Check for working environment to start logging http request
if (NODE_ENV === 'development') {
  app.use(logger('tiny'));
  console.info('Morgan enabled');
}

app.use(helmet()); // Sets various http headers

/* Apply the body-parser middleware to grab data
  from the request body and create application/json parser
*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(welcomeMessage);
});

app.use(`${urlPrefixV1}/auth`, routes.auth);
app.use(`${urlPrefixV1}/users`, routes.users);
app.use(`${urlPrefixV1}/parcels`, routes.parcels);

app.get('/api/v1/', (req, res) => {
  res.send(welcomeMessage);
});

// Apply Celebrate middleware to handle joi errors
app.use(joiErrors());

// catch 404 and forward to error handler
app.use(error404);

const run = (port = '') => {
  const server = app.listen(port || PORT, () => {
    console.info(`\nServer listenning on port: ${port || PORT}...`);
  });
  return server;
};

if (require.main === module) {
  run();
}

export default run;
