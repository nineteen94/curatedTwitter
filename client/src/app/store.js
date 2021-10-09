import {configureStore} from '@reduxjs/toolkit';
import navBarReducer from '../components/navBar/navBarSlice.js';
import tweetsReducer from '../components/tweets/tweetsSlice.js';

export default configureStore({
    reducer: {
        navBar: navBarReducer,
        tweets: tweetsReducer
    }
});