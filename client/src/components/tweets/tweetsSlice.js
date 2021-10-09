import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

const URL = 'http://localhost:4001/client/tweetData'; //CHANGE THIS TO GET GROUP DATA URL

export const loadTweetData = createAsyncThunk(
    "tweets/getTweetData",
    async (data, thunkAPI) => {
        const response = await axios.get(URL, {params: data});
        return response.data;
    }
)

const tweetsSlice = createSlice({
    name: 'tweets',
    initialState: {
        tweetData: [],
        isDone: false,
    },
    reducers: {},
    extraReducers: {
        [loadTweetData.fulfilled]: (state, action) => {
            state.isDone = false;
        },
        [loadTweetData.fulfilled]: (state, action) => {
            state.tweetData = action.payload
            state.isDone = true;
        },
        [loadTweetData.rejected]: (state, action) => {
            state.isDone = false;
        }
    }
});

export default tweetsSlice.reducer;