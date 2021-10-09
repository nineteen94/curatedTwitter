import Group from '../models/group.js';

export const getGroupData = async () => {
    let result;
    await Group.find({}).then(groups => result = groups).catch(err=>console.log(err.message));
    return result;
}