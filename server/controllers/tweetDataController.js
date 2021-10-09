import Top from '../models/top.js';

export const getTweetData = async (id) => {
    let result;

    await Top.find({group: id}).then(res => result = res).catch(err=> console.log(err.message));

    return result;
}