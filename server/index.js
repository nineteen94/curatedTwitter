import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {loadDataRouter} from './routes/loadDataRouter.js';
import {serverTestingRouter, setUpFunction} from './routes/serverTestingRouter.js';
import {clientTestingRouter} from './routes/clientTestingRouter.js'

// require('dotenv').config()

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 4001;

const CONNECTION_URL = process.env.CONNECTION_URL;

app.get('',(req,res)=>{
    res.status(200).send('its running');
})

// app.use('/load', loadDataRouter);

app.use('/client', clientTestingRouter);

app.use('/homepage',serverTestingRouter);

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`server running on ${PORT}`);
            // setUpFunction();
        })})
    .catch(err => console.log(err.message));