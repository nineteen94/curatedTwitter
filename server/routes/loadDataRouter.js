import {group_data, author_data} from '../data/sampledata.js';
import Group from '../models/group.js';
import Author from '../models/author.js';
import express from 'express';
import axios from 'axios';

export const loadDataRouter = express.Router();

const loadGroupData = async (res) => {
    for(let i = 0; i< group_data.length; i++){
        let _id = group_data[i][0];
        let name = group_data[i][1];
        let newGroup = new Group({_id, name});
        try {
            await newGroup.save();
            console.log(`Group ${i+1} created`);
        } catch (err) {
            console.log(err.message);
        }
    }
    res.status(201).send('I Think Its Done!');
}

loadDataRouter.post('/groupData', (req, res)=>{
    loadGroupData(res);
});

const loadAuthorData = async (req, res) => {
    for(let i = 0; i< author_data.length; i++){

        const _id = i+1;
        const username = author_data[i][0];
        const group = author_data[i][1];

        const newAuthor = new Author({_id, username, group});
        try {
            await newAuthor.save();
            console.log(`Author ${i+1} created`);
        } catch (err) {
            console.log(err.message);
        }
    }
    res.status(201).send('I Think Its Done!');
}

loadDataRouter.post('/authorData', loadAuthorData);

const authorDataUrl = 'https://api.twitter.com/2/users/by/username/'

const token = 'AAAAAAAAAAAAAAAAAAAAABKLQAEAAAAARfJSktsycTiD7ZvyRxmsOBfT1WY%3DnYcOOGEcx611MGgpzmCUQmTByhengmmlfaHljIxV5BJeI7a2ko';

const config = {
    headers: {Authorization: `Bearer ${token}`}
}

const loadAuthorDataFromTwitter = (req, res) => {

    Author.find({}, (err, authors) => {
        if(err) {
            res.status(404).send('Here something not quite right');
        }

        authors.map(author => {

            const id = author._id;
            const username = author.username;
            axios.get(authorDataUrl+username+'?user.fields=public_metrics',config)
            .then(result => {
                const usableResult = result.data.data;
                const twitter_author_id =  usableResult.id;
                const username = usableResult.username;
                const followers_count = usableResult.public_metrics.followers_count;
                const following_count = usableResult.public_metrics.following_count;
                const updatedAuthor = {twitter_author_id, followers_count, following_count, username, _id: id};
                Author.findByIdAndUpdate(id, updatedAuthor).then().catch(err=>console.log(err.message))
            })
            .catch(err => {
                res.status(404).send('Not working buddy. Try Again');
                console.log(err.message)
            });
            
        });
    });

    // res.status(204).send('we updated it. Yo');
        
        
}

loadDataRouter.post('/authorDataFromTwitter',loadAuthorDataFromTwitter);

