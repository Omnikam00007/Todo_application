const fs = require("fs");
const express = require('express');
const { log } = require('console');
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

let user = [];
let filePath = "todos.json";
let JWT_SECRET = "iamhulk";


function Auth(req,res,next)
{
    const token= req.headers.token;
    console.log(token);
    
    
    const decodeToken = jwt.verify(token,JWT_SECRET);
    
    
    if(decodeToken.username){
        next();
    }else{
        res.json({
            msg:"You are not signin"
        })
    }
}

function readFile(){
    return new Promise((resolve,reject)=>{
        fs.readFile(filePath,'utf-8',(err,data)=>{
            if(err){
                reject("Error reading the todos file.");
            }else{
                data = JSON.parse(data);
                resolve(data);
            }
        });
    });
}

function writeFile(data){
    return new Promise((resolve,reject)=>{
        fs.writeFile(filePath,JSON.stringify(data, null, 2),(err)=>{
            if(err){
                reject("error adding the todo.");
            }else{
                resolve("successfully added todo.");
            }
        });
    });
}

async function getTodos(){
    try{
        const todos = await readFile();
        if(todos.length === 0){
            return "You currently dont have any todos.";
        }else{
            return todos;
        }
    }catch(error){
        console.log(error);
        return error;
    }
}

async function addTodo(task){
    try{
        let todos = await readFile();
        const newTodo = {
            "id": todos.length + 1,
            "task": task,
            "isDone": false
        }
        todos.push(newTodo);
        const message = await writeFile(todos);
        console.log(message);
        return message;
    }catch(error){
        console.log(error);
        return error;
    }
}

function resetTodoId(todos){
    for(let i=0;i<todos.length;i++){
        todos[i].id = i + 1;
    }
    return todos;
}

async function deleteTodo(task){
    try{
        let todos = await readFile();
        todos = todos.filter(todo => todo.task !== task);
        if(todos.length>0){
            todos= resetTodoId(todos);
        }
        await writeFile(todos);
        return "Todo deleted successfully";
    }catch(error){
        console.log(error);
        return "Error deleting todo";
    }
}

async function updateTodo(task, status){
    try{
        let todos = await readFile();
        todos.forEach(todo =>{
            if(todo.task === task){
                todo.isDone = status;
            }
        });
        await writeFile(todos);
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

app.post('/signup',function(req,res){

    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(password != confirmPassword){
        res.send("Password do not match");
    }
   
    
   user.push({
    username: username,
    password: password
   })
    
    res.send({
        msg: "user signedup successfully"
    });

});


app.post('/signin',function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    let userFound;

    if(!username || !password){
        return res.status(400).send({ msg: "Username and password are required" });
    }
    userFound = user.find(u => u.username === username && u.password === password);

    if(userFound){
        const token = jwt.sign({
            username: userFound.username
        },JWT_SECRET);

        user.find((u)=>{
            if(u.username==userFound.username){
                u.token=token;
                u.isLogin=true;
                res.send({
                    token: token,
                    msg:"user successfully signedin"
                });
            }
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
    if(!req.body.task){
        res.status(400).send("task is not provided to add");
    }else{
        const message = await addTodo(req.body.task);
        res.json({
            message : message
        });
    }
});

app.put('/markDone',Auth,async(req,res)=>{
    if(!req.body.task || !req.body.isDone){
        req.status(400).send("body is not provided correctly");
    }else{
        const message = await updateTodo(req.body.task, req.body.isDone);
        res.send(message);
    }
});

app.get('/getTodo',Auth,async function(req,res){
    const todos = await getTodos();
    console.log(todos);
    res.json(todos);
    
})

app.delete('/deleteTodo',Auth,async(req,res)=>{
    const deleteResponse = await deleteTodo(req.body.task);
    res.send(deleteResponse);
})

app.listen(3000, ()=> console.log('Server started running on port 3000'));