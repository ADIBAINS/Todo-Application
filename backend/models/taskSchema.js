const mongoose = require("mongoose");
const TaskSchema = new mongoose.Schema({
	title : String,
	status : Boolean,
});

module.exports = mongoose.model("Task",TaskSchema);
