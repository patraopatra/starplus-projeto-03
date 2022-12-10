let http = require('http'),
    path = require('path'),
    express = require('express'),
    mongoose = require('mongoose'),
    app = express()
    

const users = require('./model/User')
mongoose.set('strictQuery', true); // contornar aviso no terminal
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

app.use(express.json())

// Criação

app.post('/user', async (req, res) => {

    const {email, password} = req.body

    if(!email){
        res.status(422).json({message: 'O email é obrigatório!'})
        return
    }

    if(!password){
        res.status(422).json({message: 'A senha é obrigatória!'})
        return
    }

    const user = {email, password}

    try{
        await users.create(user) 
        res.status(201).json({message: 'Usuario cadastrado'})
    } catch(error){
        res.status(500).json({error:error})
    }
})

// Leitura

app.get('/', async (req, res) => {
    try {
        const users = await users.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({error:error})
    }
})

app.get('/:id', async (req, res) => {
    const id = req.params.id

    try {
        const user = await users.findOne({ _id: id })

        if(!user){
            res.status(422).json({message: 'Usuário não encontrado'})
            return
        }

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error:error})
    }
})

/*
app.get('/', async (req,res) => {
    users.find().then((users) =>{
        res.render('index', {users: users})
    });
});
app.listen(3000);
*/

// mongodb+srv://matheus:xavier123@api-web.qgbcwof.mongodb.net/?retryWrites=true&w=majority

//username: matheus
//password: xavier123



mongoose.connect('mongodb+srv://matheus:xavier123@api-web.qgbcwof.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    console.log("Conectamos com sucesso!")
    app.listen(3000);
})
.catch((err) => console.log(err))