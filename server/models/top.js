import mongoose from 'mongoose';

const topSchema = mongoose.Schema({
    _id: Number,
    twitter_tweet_id: String,
    group: {
        type: Number,
        ref: 'Group'
    },
    score: {
        type: Number,
        ref: 'Tweet'
    }
});

const Top = mongoose.model('Top', topSchema);

export default Top;