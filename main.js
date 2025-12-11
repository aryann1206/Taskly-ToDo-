let express = require("express");
let {router} =require("./todos");
let app = express();
app.use(express.json());

app.use("/api",router);

app.listen(3000,()=>console.log("3000 port running"));