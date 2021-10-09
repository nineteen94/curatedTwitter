import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

const URL = 'http://localhost:4001/client/groupData'; //CHANGE THIS TO GET GROUP DATA URL

export const loadGroupData = createAsyncThunk(
    "navBar/getGroupData",
    async (data, thunkAPI) => {
        const response = await axios.get(URL);
        return response.data;
    }
)

const navBarSlice = createSlice({
    name: 'navBar',
    initialState : {
        groupData: [],
        isLoading: false,
        hasError: false,
        isDone: false
    }, //array of g objects id and name
    reducers: {

    },
    extraReducers: {
        [loadGroupData.pending] : (state, action) => {
            state.isLoading = true;
            state.hasError = false;
            state.isDone = false;

        },
        [loadGroupData.fulfilled]: (state, action) => {
            state.isLoading = false;
            state.hasError = false;
            state.groupData = action.payload;
            state.isDone = true;

        },
        [loadGroupData.rejected]: (state, action) => {
            state.hasError = true;
            state.isLoading = false;
            state.isDone = false;
        }
    }
})


export default navBarSlice.reducer;