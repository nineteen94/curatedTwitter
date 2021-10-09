import mongoose from 'mongoose';

const tweetSchema = mongoose.Schema({
    _id: Number,
    twitter_tweet_id: String,
    twitter_author_id: String,
    text: String, 
    created_at: String,
    
    retweet_count: Number,
    reply_count: Number,
    like_count: Number,
    quote_count: Number,
    
    referenced_tweets_type: Boolean, //quoted or retweeted or null
    
    ref_retweet_count: Number,
    ref_reply_count: Number,
    ref_like_count: Number,
    ref_quote_count: Number,

    author_followers_count: Number,
    author_following_count: Number,
    ref_author_followers_count: Number,
    ref_author_following_count: Number,

    score: Number,
    group: {
        type: Number,
        ref: 'Group'
    }
});

const Tweet = mongoose.model('Tweet', tweetSchema);

export default Tweet;