if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

const Task = require("../backend/models/taskSchema");
const User = require("../backend/models/userSchema");
const {createTask, updateTaskStatus, updateTaskTitle, usersignup, usersignin} = require("../backend/types");
const auth = require("../backend/middleware/auth");

const app = express();
const port = process.env.PORT || 3000;
const jwtsec = process.env.JWT_SECRET;
const mongourl = process.env.MONGO_URL;

// Database connection
async function main(){
	await mongoose.connect(mongourl);
}

main()
	.then(() => console.log("✓ MongoDB Connection Established"))
	.catch((err) => console.error("✗ MongoDB Connection Error:", err.message));

// Middleware - Order matters!
app.use(cors({
    origin: 'https://todo-application-v1-bains.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Health check (no auth required)
app.get("/health", (req, res) => {
	res.json({msg: "✓ Server is running"});
});

// ============ TASK ROUTES ============

// GET all tasks
app.get("/tasks", auth, async (req, res) => {
	try{
		const email = req.email;
		const user = await User.findOne({email}).populate('tasks');
		
		if(!user){
			return res.status(404).json({msg: 'User not found'});
		}
		
		res.json({tasks: user.tasks});
	}catch(err){
		console.error("GET /tasks error:", err.message);
		res.status(500).json({msg: 'Server error', error: err.message});
	}
});

// POST create task
app.post("/tasks", auth, async (req, res) => {
	try{
		const createpayload = req.body;
		const parsepayload = createTask.safeParse(createpayload);
		
		if(!parsepayload.success){
			return res.status(400).json({msg: 'Invalid Data Entry', errors: parsepayload.error});
		}
		
		const {title, status} = req.body;
		const email = req.email;
		
		const task = new Task({
			title: title,
			status: status || false,
		});
		
		await task.save();
		
		const user = await User.findOne({email});
		if(!user){
			return res.status(404).json({msg: 'User not found'});
		}
		
		user.tasks.push(task._id);
		await user.save();
		
		res.status(201).json({msg: "Task created successfully", task});
	}catch(err){
		console.error("POST /tasks error:", err.message);
		res.status(500).json({msg: 'Error creating task', error: err.message});
	}
});

// PUT update task
app.put("/tasks/:id", auth, async (req, res) => {
	try{
		const {id} = req.params;
		const {title, status} = req.body;
		
		let task = await Task.findById(id);
		if(!task){
			return res.status(404).json({msg: 'Task not found'});
		}
		
		if(title !== undefined){
			const parsepayloadtitle = updateTaskTitle.safeParse({title});
			if(!parsepayloadtitle.success){
				return res.status(400).json({msg: 'Invalid title', errors: parsepayloadtitle.error});
			}
			task.title = title;
		}
		
		if(status !== undefined){
			const parsepayloadstatus = updateTaskStatus.safeParse({status});
			if(!parsepayloadstatus.success){
				return res.status(400).json({msg: 'Invalid status', errors: parsepayloadstatus.error});
			}
			task.status = status;
		}
		
		await task.save();
		res.json({msg: 'Task updated successfully', task});
	}catch(err){
		console.error("PUT /tasks/:id error:", err.message);
		res.status(500).json({msg: 'Error updating task', error: err.message});
	}
});

// DELETE task
app.delete("/tasks/:id", auth, async (req, res) => {
	try{
		const {id} = req.params;
		const email = req.email;
		
		const user = await User.findOne({email});
		if(!user){
			return res.status(404).json({msg: 'User not found'});
		}
		
		user.tasks = user.tasks.filter(x => x.toString() !== id);
		await user.save();
		
		const deltask = await Task.findByIdAndDelete(id);
		if(!deltask){
			return res.status(404).json({msg: 'Task not found'});
		}
		
		res.json({msg: 'Task deleted successfully', task: deltask});
	}catch(err){
		console.error("DELETE /tasks/:id error:", err.message);
		res.status(500).json({msg: 'Error deleting task', error: err.message});
	}
});

// ============ AUTH ROUTES ============

// POST signup
app.post("/signup", async (req, res) => {
	try{
		const createpayload = req.body;
		const parsepayload = usersignup.safeParse(createpayload);
		
		if(!parsepayload.success){
			return res.status(400).json({
				msg: "Invalid Request",
				errors: parsepayload.error
			});
		}
		
		const {name, email, password} = req.body;
		
		const userexists = await User.findOne({email});
		if(userexists){
			return res.status(409).json({msg: "User already exists"});
		}
		
		const user = new User({
			name,
			email,
			password
		});
		
		await user.save();
		
		const token = jwt.sign({email}, jwtsec, {expiresIn: '2d'});
		res.cookie("token", token, {
    		httpOnly: true,
    		secure: true,
    		sameSite: "none",
    		maxAge: 24 * 60 * 60 * 1000
  		});
		
		res.status(201).json({msg: "User created successfully"});
	}catch(err){
		console.error("POST /signup error:", err.message);
		res.status(500).json({
			msg: "Server error",
			error: err.message
		});
	}
});

// POST signin
app.post("/signin", async (req, res) => {
	try{
		const createpayload = req.body;
		const parsepayload = usersignin.safeParse(createpayload);
		
		if(!parsepayload.success){
			return res.status(400).json({
				msg: 'Invalid email format',
				errors: parsepayload.error
			});
		}
		
		const {email, password} = req.body;
		
		const user = await User.findOne({email});
		
		if(!user){
			return res.status(401).json({msg: "Invalid credentials"});
		}
		
		if(user.password !== password){
			return res.status(401).json({msg: "Invalid credentials"});
		}

		const token = jwt.sign({email}, jwtsec, {expiresIn: '2d'});
		res.cookie("token", token, {
    		httpOnly: true,
    		secure: true,
    		sameSite: "none",
    		maxAge: 24 * 60 * 60 * 1000
  		});
		
		res.json({msg: "Login successful"});
	}catch(err){
		console.error("POST /signin error:", err.message);
		res.status(500).json({
			msg: "Server error",
			error: err.message
		});
	}
});

// GET signout
app.get("/signout", (req, res) => {
	res.clearCookie("token");
	res.json({msg: "Successfully Logged Out"});
});

// Start server
app.listen(port, () => {
	console.log(`✓ Server running on port ${port}`);
});