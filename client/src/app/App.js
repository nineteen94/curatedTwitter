import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {NavBar} from '../components/navBar/NavBar.js';
import {loadGroupData} from '../components/navBar/navBarSlice.js';
import Spinner from '../components/common/Spinner.js';

export const App = () => {
    const dispatch = useDispatch();

    useEffect( () => {
        dispatch(loadGroupData())
    },[dispatch]);

    const {hasError} = useSelector(state => state.navBar);

    if(hasError) {
        return (
        <div>
            <p> Something went wrong</p>
        </div>
        );
    }

    const {isLoading} = useSelector(state => state.navBar);

    if (isLoading) {
        return <Spinner />;
    }

    return <NavBar />;
}
