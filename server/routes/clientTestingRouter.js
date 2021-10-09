import express from 'express';
import {getGroupData} from '../controllers/groupDataController.js';
import {getTweetData} from '../controllers/tweetDataController.js';

export const clientTestingRouter = express.Router();

clientTestingRouter.get('/groupData', async (req, res) => {
    const result = await getGroupData();
    if(result) {
        res.status(201).send(result);
    } else {
        res.status(404).send('Pls try again');
    }
})

clientTestingRouter.get('/tweetData', async (req, res) => {

    const result = await getTweetData(req.query.id);
    if(result) {
        res.status(201).send(result);
    } else {
        res.status(404).send('Pls try again');
    }
})