import express from 'express';
import Author from '../models/author.js';
import Tweet from '../models/tweet.js'
import axios from 'axios';  
import Group from '../models/group.js';
import Top from '../models/top.js'

export const serverTestingRouter = express.Router();

const tweetQuery_start = 'https://api.twitter.com/2/tweets/search/recent?query=';
const tweetQuery_end = ' -is:reply&tweet.fields=public_metrics,created_at&expansions=referenced_tweets.id,author_id,referenced_tweets.id.author_id&max_results=100&user.fields=public_metrics'
const token = 'AAAAAAAAAAAAAAAAAAAAABKLQAEAAAAARfJSktsycTiD7ZvyRxmsOBfT1WY%3DnYcOOGEcx611MGgpzmCUQmTByhengmmlfaHljIxV5BJeI7a2ko';
const config = {
    headers: {Authorization: `Bearer ${token}`}
}


const getStartTime = () => {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate()-4);
    return '&start_time=' + currentDate.toISOString();
}

const getUserString = async () => {
    let userString = '(';

    await Author.find({})
    .then(authors => {
        authors.map(author => {
            userString = userString.concat("from:", author.username, " OR ");
        });
    }).catch(err => {
        console.log(err.message);
    });

    userString = userString.slice(0, userString.length - 4);
    userString = userString.concat(')');
    return userString;
}

const getTweetDump = async () => {
    const tweetQuery = tweetQuery_start + await getUserString() + tweetQuery_end + getStartTime();
    
    let finalResult = {
        tweets: [],
        refTweets:[],
        users:[]
    };
    let nextTweetQuery = '';
    let tempDataResult = [];
    let tempIncludesTweetsResult = [];
    let tempIncludesUsersResult = [];

    await axios.get(tweetQuery, config)
        .then(async (result) => {
            let nextToken = result.data.meta.next_token;
            let i = 1;

            tempDataResult = tempDataResult.concat(result.data.data);
            tempIncludesTweetsResult = tempIncludesTweetsResult.concat(result.data.includes.tweets);
            tempIncludesUsersResult = tempIncludesUsersResult.concat(result.data.includes.users);
            
            while(nextToken){
                console.log(`Iteration ${i}`);
                i++;

                nextTweetQuery = tweetQuery + '&next_token=' + nextToken;

                await axios.get(nextTweetQuery, config)
                    .then(result => {
                        tempDataResult = tempDataResult.concat(result.data.data);
                        tempIncludesTweetsResult = tempIncludesTweetsResult.concat(result.data.includes.tweets); 
                        tempIncludesUsersResult = tempIncludesUsersResult.concat(result.data.includes.users); 
                        nextToken = result.data.meta.next_token;
                    }).catch(err => console.log('5.' + err.message));

            }
        }).catch(err => console.log('6.' + err.message));
    

    finalResult.tweets = tempDataResult;
    finalResult.refTweets = tempIncludesTweetsResult;
    finalResult.users = tempIncludesUsersResult;
    console.log('Got the Tweet Dump');
    return finalResult;


}

const findIDInArray = (array, string) => {
    for(let i = array.length - 1; i >= 0; i --) {
        if(!string.localeCompare(array[i].id)) {
            return i;
        } 
    }
}

const getUpdatedTweet = (array, i, isRetweet) => {
    if(isRetweet) {
        return {
            ref_retweet_count: array[i].public_metrics.retweet_count,
            ref_reply_count : array[i].public_metrics.reply_count,
            ref_like_count : array[i].public_metrics.like_count,
            ref_quote_count : array[i].public_metrics.quote_count
        }
    } else {
        return {
            retweet_count: array[i].public_metrics.retweet_count,
            reply_count : array[i].public_metrics.reply_count,
            like_count : array[i].public_metrics.like_count,
            quote_count : array[i].public_metrics.quote_count
        }
    }
}

const getNewTweet = (id, tweets, users, refTweets, tweetsArrayID, usersArrayID, refTweetsArrayID,refUsersArrayID, isRetweet) => {
    let newTweetObject = {
        _id: id,
        twitter_tweet_id: tweets[tweetsArrayID].id,
        twitter_author_id: tweets[tweetsArrayID].author_id,
        text: tweets[tweetsArrayID].text,
        created_at: tweets[tweetsArrayID].created_at,
        author_followers_count: users[usersArrayID].public_metrics.followers_count,
        author_following_count: users[usersArrayID].public_metrics.following_count,
        referenced_tweets_type: isRetweet
    }
    if(isRetweet) {
        newTweetObject = {
            ...newTweetObject,
            ref_retweet_count: refTweets[refTweetsArrayID].public_metrics.retweet_count,
            ref_reply_count : refTweets[refTweetsArrayID].public_metrics.reply_count,
            ref_like_count : refTweets[refTweetsArrayID].public_metrics.like_count,
            ref_quote_count : refTweets[refTweetsArrayID].public_metrics.quote_count,
            ref_author_followers_count : users[refUsersArrayID].public_metrics.followers_count,
            ref_author_following_count : users[refUsersArrayID].public_metrics.following_count
        }
    } else {
        newTweetObject = {
            ...newTweetObject,
            retweet_count: tweets[tweetsArrayID].public_metrics.retweet_count,
            reply_count : tweets[tweetsArrayID].public_metrics.reply_count,
            like_count : tweets[tweetsArrayID].public_metrics.like_count,
            quote_count : tweets[tweetsArrayID].public_metrics.quote_count
        }
    }
    return newTweetObject;
}


const addTweetsToDB = async ({tweets, refTweets, users}) => {
    
    let tweetExists;
    let isRetweet;
    
    let updatedTweet;
    let newTweet;

    let count;
    let usersArrayID;
    let refUsersArrayID;
    let refTweetsArrayID;
    

    for(let i = tweets.length - 1 ; i >= 0; i --) {

        //can be done separately 
        await Tweet.findOne({twitter_tweet_id: tweets[i].id})
            .then(obj => {
                if(obj) {
                    tweetExists = true;
                    isRetweet = obj.referenced_tweets_type;
                } else {
                    tweetExists = false;
                }
            }).catch(err => console.log('1.' + err.message));
        
        if(tweetExists) { //UPDATE EXISTING TWEET

            if(!isRetweet) {
                //getUpdatedRetweet
                updatedTweet = getUpdatedTweet(tweets, i, isRetweet);

            } else {

                //findIDInArray
                refTweetsArrayID = findIDInArray(refTweets, tweets[i].referenced_tweets[0].id)

                //getUpdatedTweet
                updatedTweet = getUpdatedTweet(refTweets, refTweetsArrayID, isRetweet);

            }

            //updateTweetInDB
            await Tweet.findOneAndUpdate({twitter_tweet_id: tweets[i].id}, updatedTweet).catch(err => console.log('2.' + err.message));
        
        } else { //NEW TWEET TO BE ADDED

            usersArrayID = findIDInArray(users, tweets[i].author_id);

            //getting new Primary ID for the DB
            await Tweet.countDocuments({}).then(res => count = res + 1).catch(err => console.log('3.' + err.message));

            //check whether it is retweet or not
            isRetweet = false;
            if(tweets[i].referenced_tweets){
                if(!tweets[i].referenced_tweets[0].type.localeCompare('retweeted'))
                isRetweet = true;
            }

            if(isRetweet) {
                //finding original tweet in ref_Tweets Array
                refTweetsArrayID = findIDInArray(refTweets, tweets[i].referenced_tweets[0].id);

                //finding origingal author in users array
                refUsersArrayID = findIDInArray(users, refTweets[refTweetsArrayID].author_id);
            } 

            //getting new tweet object
            newTweet = getNewTweet(count, tweets, users, refTweets, i, usersArrayID, refTweetsArrayID ,refUsersArrayID, isRetweet);

            const newTweetField = new Tweet(newTweet);

            await newTweetField.save().catch(err => console.log('4.' + err.message));


        }

    }

    console.log('Tweets Added To DB');

}

const getTweetScore = (likes, comments, retweets, followers) => {
    let score = 0.5*likes + comments + 3*retweets;
    score = score/Math.pow(followers, 1/3);
    return score;
}

const getGroupID = async (twitter_author_id) => {
    let id;
    await Author.findOne({twitter_author_id: twitter_author_id})
            .then(res => id = res.group)
            .catch(err => console.log('10.' + err.message));

    return id;
}

const insertScoreAndGroupInDB = async () => {
    
    await Tweet.find({})
        .then( async (tweets) => {
            tweets.map( async (tweetobj) => {
                let score;
                if(tweetobj.referenced_tweets_type){
                    score = getTweetScore(tweetobj.ref_like_count, tweetobj.ref_reply_count, tweetobj.ref_retweet_count, tweetobj.ref_author_followers_count);
                } else {
                    score = getTweetScore(tweetobj.like_count, tweetobj.reply_count, tweetobj.retweet_count, tweetobj.author_followers_count);                    
                }

                const groupID = await getGroupID(tweetobj.twitter_author_id);

                const updatedTweet = {
                    score: score,
                    group: groupID
                };

                await Tweet.findByIdAndUpdate(tweetobj._id, updatedTweet).catch(err=> console.log(err.message));
            })
        }).catch(err => console.log(err.message));

    console.log('Score and Group Assigned to Tweets in DB');
}

const sortTweetObjFunc = (a,b) => {
    const num1 = a.score;
    const num2 = b.score;
    return (num2-num1);
}

const updateTopDB = async () => {
    await Top.deleteMany({});
    await Group.find({}).then(groups => {
        let id = 1;
        groups.map(async (groupObj) => {

            const groupID = groupObj._id;
            let topArray =[];

            await Tweet.find({group: groupID}).then((tweets) => topArray = tweets);
            topArray.sort(sortTweetObjFunc);

            for(let i = 0; i < 10; i ++) {
                if(i === topArray.length) break;

                const topObj = {
                    _id: id,
                    twitter_tweet_id: topArray[i].twitter_tweet_id,
                    group: groupID,
                    score: topArray[i].score
                }
                const newTop = new Top(topObj);

                await newTop.save().then(id++).catch(err=> console.log('12. ' + err.message));


            }

        })
    })

    console.log('Top DB Updated');

}

serverTestingRouter.get('', async (req,res)=>{

    // await Tweet.deleteMany({});

    // const tweetDump = await getTweetDump();

    // await addTweetsToDB(tweetDump);

    // await insertScoreAndGroupInDB();

    // await updateTopDB();

    res.status(200).send();

    
});




import schedule from 'node-schedule';

const runAllFunctions = async () => {
    // await Tweet.deleteMany({});

    const tweetDump = await getTweetDump();

    await addTweetsToDB(tweetDump);

    await insertScoreAndGroupInDB();

    await updateTopDB();
}

export const setUpFunction = async () => {

    // await runAllFunctions();

    let rule = new schedule.RecurrenceRule();
    rule.hour = 8;
    rule.tz = 'Asia/Oral';

    schedule.scheduleJob(rule, function () {
         runAllFunctions();
    });

}