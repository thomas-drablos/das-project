import { model, now, Schema } from "mongoose";

const logSchema = new Schema({
    event: String,
    time: { type: Date, required: true, default: now },
    activeUser: { type: Schema.Types.ObjectId, ref: 'User' },
    vendorRef: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    oldValue: String,
    newValue: String,
});
const EventLog = model('EventLog', logSchema);
export default EventLog;
