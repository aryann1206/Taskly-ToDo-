const express = require("express");
const router = express.Router();
let { userZodSchema, userLoginSchema, mark } = require("./zod");
let jwt = require("jsonwebtoken");
let mongoose = require("mongoose");
let { userModel, todoModel } = require("./db");
let secret = "jbhdvfldfj";
router.post("/signup", async (req, res) => {
    try {
        let { success, data, error } = userLoginSchema.safeParse(req.body);
        if (!success) {
            res.status(401).json({
                message: "not following schema",
                error: error
            });
            return;
        }
        let exsiting = await userModel.findOne({ email: data.email });
        if (exsiting) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        let user = await userModel.create({ username: data.username, email: data.email, password: data.password, todo: [] });
        if (user) {
            let token = jwt.sign({ username: user.username, userId: user._id }, secret);
            res.status(201).json({
                message: "successfully account created",
                token: token
            });
            return;
        }
    }
    catch (e) {
        res.status(500).json({
            message: "internet error",
            error: error
        });
        return;
    }

})


router.post("/signin", async (req, res) => {
    let { success, data, error } = userLoginSchema.safeParse(req.body);
    if (!success) {
        res.status(401).json({
            message: "not following schema",
            error: error
        });
        return;
    }

    try {
        let user = await userModel.findOne({ email: data.email, password: data.password });
        if (user) {
            let token = jwt.sign({ username: user.username, userId: user._id }, secret);
            res.status(201).json({
                message: "successfully login",
                token: token
            });
            return;
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    }
    catch (e) {
        return res.status(500).json({
            message: "Server error",
            error: e.message
        })
    }
})



function MiddlewareAuth(req, res, next) {
    let token = req.headers.token;
    if (!token) {
        return res.status(401).json({
            message: "Token missing"
        });
    }
    try {
        let { username, userId } = jwt.verify(token, secret);
        req.userId = userId;
        req.username = username;
        next();
    }
    catch (e) {
        return res.status(401).json({
            message: "unautherized user"
        })
    }
}



router.post("/todos", MiddlewareAuth, async (req, res) => {
    try {
        let userId = req.userId;
        let { title } = req.body;
        let user = await todoModel.create({ title, userId, completed: false })
        res.status(201).json({
            message: "successfully todo created",
            todo: user,
            completed: user.completed
        });
        return;
    }
    catch (e) {
        return res.status(500).json({
            message: "Server error",
            error: e.message
        })
    }
})


router.get("/todos", MiddlewareAuth, async (req, res) => {
    try {
        let userId = req.userId;
        let todo = await todoModel.find({ userId });
        res.status(200).json({
            todo
        })
        return;
    }
    catch (e) {
        return res.status(500).json({
            message: "Server error",
            error: e.message
        })
    }
})



router.put("/todos/:todoId", async (req, res) => {
    try {
        let { success, data, error } = mark.safeParse(req.body);
        if (!success) {
            res.status(401).json({
                message: "not following schema",
                error: error
            });
            return;
        }

        const todoId = req.params.todoId;
        const todo = await todoModel.findById(todoId);
        todo.completed = data.completed;
        todo.save();
        res.status(200).json({
            message: "Your " + todo.title + " marked" + data.completed
        })
        return;
    }
    catch (e) {
        return res.status(500).json({
            message: "Server error",
            error: e.message
        })
    }
})




router.delete("/todos/:todoId", MiddlewareAuth, async (req, res) => {
    try {
        const todoId = req.params.todoId;

        const todo = await todoModel.findOneAndDelete({
            _id: todoId,
            userId: req.userId
        });

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Todo deleted",
            deletedTodo: todo
        });

    } catch (e) {
        return res.status(500).json({
            message: "Server error",
            error: e.message
        });
    }
});



module.exports={
    router
}