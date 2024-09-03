import { audioResponse } from "@/app/generatemusic/page";
import { videoResponse } from "@/app/page";
import mongoose from "mongoose";

const {Schema, model} = mongoose;

const userSchema = new Schema({
    email: {type:String, required: true},
    username: {type: String, required: true},
    DataComedyShow: {type: Array<videoResponse>},
    DataCustomMusic: {type: Array<audioResponse>}
    //add more fields as needed
})

export default mongoose.models?.User || mongoose.model("User", userSchema);