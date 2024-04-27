require('dotenv').config();
const express = require('express')
const app = express()
const port = 5001

const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes')
const humanRoutes = require('./routes/humanRoutes')
const woodRoutes = require('./routes/woodRoutes')
const electricRoutes = require('./routes/electricRoutes')
const resultRoutes = require('./routes/resultRoutes')

const expressFileUpload = require('express-fileupload')
const path = require('path');
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('combined'));
app.use(expressFileUpload())
app.use('/api/user', authRoutes);
app.use('/api/human', humanRoutes);
app.use('/api/wood', woodRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/electric', electricRoutes);
app.use(express.static(path.join(__dirname, 'public')));

const db = require("./models");
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})