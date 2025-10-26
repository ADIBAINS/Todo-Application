const mongoose = require("mongoose");
const Task = require("../models/taskSchema");
const UserSchema = new mongoose.Schema({
	name : String,
	email : String,
	password : String,
	tasks : [{
		type : mongoose.Schema.Types.ObjectId,
		ref : "Task"}]
	});

module.exports = mongoose.model("User",UserSchema);

