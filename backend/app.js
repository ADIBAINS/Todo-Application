if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const Task = require("../backend/models/taskSchema");
const User = require("../backend/models/userSchema");
const {createTask,updateTaskStatus,updateTaskTitle,usersignup,usersignin} = require("../backend/types");
const auth = require("../backend/middleware/auth");
const jwtsec = process.env.JWT_SECRET;
const cookieParser = require("cookie-parser");
const mongourl = process.env.MONGO_URL;
async function main(){
	await mongoose.connect(mongourl);
}

main().then(()=>{
	console.log("Connection Established");
}).catch((err)=>{
	console.log(err);
})
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  
app.use(cookieParser());



app.get("/tasks", auth, async (req,res)=>{
	try{
		const email = req.email;
		const user = await User.findOne({email}).populate('tasks');
		if(!user){
			return res.status(404).json({msg: 'User not found'});
		}
		res.render("tasks/tasks.ejs",{tasks : user.tasks});
	}catch(err){
		res.status(500).json({msg: 'Server error', error: err.message});
	}
})

app.post("/tasks", auth, async (req,res)=>{
	const createpayload = req.body;
	const parsepayload = createTask.safeParse(createpayload);
	
	if(!parsepayload.success){
		return res.status(400).json({msg: 'Invalid Data Entry', errors: parsepayload.error});
	}
	
	try{
		const task_name = req.body.title;
		const status = req.body.status || false;
		const email = req.email;
		
		const task = new Task({
			title: task_name,
			status: status,
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
		res.status(500).json({msg: 'Error creating task', error: err.message});
	}
});

app.put("/tasks/:id", auth, async(req,res)=>{
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
		res.status(500).json({msg: 'Error updating task', error: err.message});
	}
});

app.delete("/tasks/:id", auth, async(req,res)=>{
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
		res.status(500).json({msg: 'Error deleting task', error: err.message});
	}
})
app.get("/signup",async (req,res)=>{
	res.render("users/signup.ejs");
});
app.post("/signup", async (req,res)=>{
	console.log(req.body);
	const createpayload = req.body;
	const parsepayload = usersignup.safeParse(createpayload);
	
	if(!parsepayload.success){
		return res.status(400).json({
			msg: "Invalid Request",
			errors: parsepayload.error
		});
	}
	
	try{
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
    		secure: false,      
    		sameSite: "lax",    
    		maxAge: 24 * 60 * 60 * 1000
  		});
		
		res.status(201).json({
			msg: "User created successfully"
		});
	}catch(err){
		res.status(500).json({
			msg: "Server error",
			error: err.message
		});
	}
});
app.get("/signin",async (req,res)=>{
	res.render("users/signin.ejs");
});
app.post("/signin", async(req,res)=>{
	const createpayload = req.body;
	const parsepayload = usersignin.safeParse(createpayload);
	
	if(!parsepayload.success){
		return res.status(400).json({
			msg: 'Invalid email format',
			errors: parsepayload.error
		});
	}
	
	try{
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
    		secure: false,      
    		sameSite: "lax",    
    		maxAge: 24 * 60 * 60 * 1000
  		});
		res.json({
			msg: "Login successful"
		});
	}catch(err){
		res.status(500).json({
			msg: "Server error",
			error: err.message
		});
	}
})


app.get("/signout",(req,res)=>{
	res.clearCookie("token");
	res.json({
		msg:"Successfully Logged Out"
	});
})

app.listen(port, ()=>{
	console.log(`The Server is up on Port : ${port}`);
});