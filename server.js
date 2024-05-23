const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const ngrok = require('ngrok');

const app = express();

app.use(express.json());
app.use(bodyParser.json());

const testRouter = require('./pergolaRoute');

app.use('/CompanyCam', testRouter);



const PORT = process.env.PORT||5000;
 
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
