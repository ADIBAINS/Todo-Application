const z = require("zod");

const createTask = z.object({
    title: z.string().min(1, "Title cannot be empty"),
    status: z.boolean().optional()
});

const updateTaskStatus = z.object({
    status: z.boolean()
});

const updateTaskTitle = z.object({
    title: z.string().min(1, "Title cannot be empty")
});

const usersignup = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const usersignin = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

module.exports = {
    createTask,
    updateTaskStatus,
    updateTaskTitle,
    usersignup,
    usersignin
};