const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');


const app = express();
const PORT = process.env.PORT || 3000;
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(__dirname + '/public'));


app.get("/notes", (req,res)=>{
    res.sendFile(path.join(__dirname, "public/notes.html"));
});


app.get("/api/notes", (req,res)=>{

    readFileAsync("./db/db.json", "utf8")
    .then((result, err)=>{
        if(err) console.log(err);       
        return res.json(JSON.parse(result));       
    });     
});

app.get("*", (req,res)=>{
    res.sendFile(path.join(__dirname, "public/index.html"));
});

//save note
app.post("/api/notes", (req,res)=>{
    let newNote = req.body;
    //get our notes
    readFileAsync("./db/db.json", "utf8")
    .then((result, err)=>{
        if(err) console.log(err);
        return Promise.resolve(JSON.parse(result));               
    })
    .then(data =>{
        //get the next index
        newNote.id = getLastIndex(data) + 1;
        //add the entry to the list
        (data.length > 0)? data.push(newNote):data = [newNote];
        return Promise.resolve(data);
    })
    .then(data =>{
        //write the new file
        writeFileAsync("./db/db.json", JSON.stringify(data));
        res.json(newNote);
    })
    .catch(err =>{
        if(err) throw err;
    });
});

//delete note
app.delete('/api/notes/:id', (req,res)=>{

    let id = req.params.id;
    //read our notes    
    readFileAsync("./db/db.json", "utf8")
    .then((result, err)=>{
        if(err) console.log(err);
        return Promise.resolve(JSON.parse(result));               
    })
    .then(data =>{
        //removing the entry from the read data         
        data.splice(data.indexOf(data.find(element => element.id == id)),1);
        return Promise.resolve(data);
    })
    .then(data =>{
        //write out our updated list
        writeFileAsync("./db/db.json", JSON.stringify(data));
        res.send("OK");
    })
    .catch(err =>{
        if(err) throw err;
    });
});

//404 but currently unused
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

//start the server
app.listen(PORT, function(){
    console.log(`Listening on PORT ${PORT}`);
});

//helper function to get the last used ID
function getLastIndex(data){
    if (data.length > 0) return data[data.length-1].id;
    return 0;
