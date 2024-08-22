import mongoose from "mongoose";

const {Schema, model} = mongoose;

const userSchema = new Schema({
    email: {type:String, required: true},
    username: {type: String, required: true},
    data: {type: Array<any>}
    //add more fields as needed
})

export default mongoose.models?.User || mongoose.model("User", userSchema);