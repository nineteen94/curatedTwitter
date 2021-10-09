import React, { useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {loadTweetData} from './tweetsSlice.js';
import { Tweet } from 'react-twitter-widgets'

export const Tweets = (props) => {
    const id = props.id;

    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(loadTweetData({"id": id})); 
    },[dispatch])

    const {tweetData} = useSelector(state => state.tweets);

    const {isDone} = useSelector(state => state.tweets);

    if(isDone) {
    return (
        <div>
            {tweetData.map(tweet => (<Tweet tweetId={tweet.twitter_tweet_id}/>))}
        </div>
    )} else {

        return (
        <div>
            <p>HEre ?</p>
        </div>
        );
    }
}

//