"use server"

import { ObjectUser } from "@/app/page"
import connectDB from "@/db/connectDb"
import User from "@/models/User"
import { notFound } from "next/navigation"

export const fetchuser = async (email: any) => {
    await connectDB()
    let u = await User.findOne({email: email})
    //console.log(u)
    if (!u) {
        return;
    }
    let user = u.toObject({flattenObjectIds : true})
    user = JSON.parse(JSON.stringify(user))
    console.log(user)

    return user
}

export const updateProfile = async (data: ObjectUser) => {
    await connectDB();
    console.log(data, 'update Profile')
    await User.updateOne({email: data.email}, data)
}