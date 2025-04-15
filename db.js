const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const User = new Schema({
    email: String ,
    password: String 
})

const Todo = new Schema({
    task: String,
    isDone: Boolean,
    userId: ObjectId
})


const userModel = mongoose.model("user",User);
const todoModel = mongoose.model("todo",Todo);

module.exports = {
    userModel : userModel,
    todoModel : todoModel
}