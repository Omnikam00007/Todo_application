const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const { userModel, todoModel} = require("./db");
const {Auth,JWT_SECRET} = require("./Auth");

mongoose.connect("mongodb+srv://omnikam33:57J2Whx6ATIE18ZD@cluster0.tk0mobi.mongodb.net/todo-database-app");

async function getTodos(ObjectId){
    try{
        
        const todos = await todoModel.find({
            userId: ObjectId
        });
     
        
        if(todos == null){
            return false;
        }else{
            return todos;
        }
    }catch(error){
        console.log(error);
        return error;
    }
}

async function addTodo(task,ObjectId){
    try{
        let todos = await todoModel.create({
            task: task,
            isDone: false,
            userId: ObjectId
        });
        return "todo added successfully";
    }catch(error){
        console.log(error);
        return error;
    }
}

async function deleteTodo(id){
    try{
        await todoModel.findByIdAndDelete(id)
        return "Todo deleted successfully";
    }catch(error){
        console.log(error);
        return "Error deleting todo";
    }
}

async function updateTodo(id, status){
    try{
        await todoModel.findById(id).updateOne({
            isDone: status
        });
        return "Todo marked done successfully";
    }catch(error){
        console.log(error);
        return "Error updating todo";
    }
}

app.use(express.json());
app.use(cors());



app.get('/signup',function(req,res){
    res.sendFile(__dirname + "/public/signup.html");
})

app.get('/signin',function(req,res){
    res.sendFile(__dirname + "/public/signin.html");

})

app.post('/signup',async function(req,res){

    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(password != confirmPassword){
        res.send("Password do not match");
    }
   
    
  try{ 
    const response = await userModel.create({
    email: username,
    password: password
   })   
   if(!response){
    return res.status(409).send("Unable to signup");
   }
   res.send({
    msg: "user signedup successfully"
});

 }catch(error){
    console.log(error);
 }
    
});


app.post('/signin',async function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    let userFound;

    if(!username || !password){
        return res.status(400).send({ msg: "Username and password are required" });
    }
    userFound = await userModel.findOne({
        email: username,
        password: password
    })

    if(userFound){
        const token = jwt.sign({
            id: userFound._id
        },JWT_SECRET);
                res.send({
                    token: token,
                    msg:"user successfully signedin"
                });
            
    }
    else{
        return res.status(401).send({ msg: "Invalid username or password" });
    }

});

app.get('/',function(req,res){
    res.sendFile(__dirname + "/public/dashBoard.html")
})

app.post('/addTodo',Auth,async function (req,res){
    if(!req.body.task || !req.ObjectId){
        res.status(400).send("task is not provided to add");
    }else{
        const message = await addTodo(req.body.task,req.ObjectId);
        res.json({
            message : message
        });
    }
});

app.put('/markDone',Auth,async(req,res)=>{
   
    if( !req.body.id && !req.body.isDone){
        res.status(400).send("body is not provided correctly");
    }else{
        const message = await updateTodo(req.body.id, req.body.isDone);
        res.send(message);
    }
});

app.get('/getTodo',Auth,async function(req,res){

    const todos = await getTodos(req.ObjectId);
    if(todos){
        res.json(todos);
    }else{
        res.status(200).send(todos);
    }
    
    
})

app.delete('/deleteTodo',Auth,async(req,res)=>{
    const deleteResponse = await deleteTodo(req.body.id);
    res.send(deleteResponse);
})

app.listen(3000, ()=> console.log('Server started running on port 3000'));