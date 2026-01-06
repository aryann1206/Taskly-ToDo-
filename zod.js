const z = require("zod");

// const userZodSchema = z.object({
//     username: z.string(),
//     email: z.string().email({ message: "Invalid email" }),
//     password: z.string()

// });



const userLoginSchema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string()

});

const mark = z.object({
    completed: z.boolean()
})
module.exports = {
    
    userLoginSchema,
    mark
}