import mongoose from 'mongoose';

const groupSchema = mongoose.Schema({
    _id: Number,
    name: String,
});

const Group = mongoose.model('Group',groupSchema);

export default Group;