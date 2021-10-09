import mongoose from 'mongoose';

const authorSchema = mongoose.Schema({
    _id: Number,
    username: String,
    twitter_author_id: String,
    followers_count: Number,
    following_count: Number,
    group: {
        type: Number,
        ref: 'Group'
    }
});

const Author = mongoose.model('Author', authorSchema);

export default Author;