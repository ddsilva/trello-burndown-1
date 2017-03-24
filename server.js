'use strict';

import dotenv from 'dotenv';
import express from 'express';
import expressHbs from 'express-handlebars';
import bodyParser from 'body-parser';
import routes from './app/config/routes';
import errors from './app/config/errors';

dotenv.config();

const app = express();
const hbs = expressHbs.create({
    layoutsDir: 'views/layouts/',
    defaultLayout: 'main',
    extname: '.hbs'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);
app.use('/public', express.static('dist'));

app.listen(app.get('port'), function() {
  console.log(`Running on port ${app.get('port')}`);
});

module.exports = app;
