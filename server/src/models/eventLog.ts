import { model, now, Schema } from "mongoose";

const logSchema = new Schema({
    event: String,
    time: { type: Date, required: true, default: now },
    activeUser: { type: Schema.Types.ObjectId, ref: 'User' },
    oldValue: String,
    newValue: String,
});
const EventLog = model('EventLog', logSchema);
export default EventLog;
