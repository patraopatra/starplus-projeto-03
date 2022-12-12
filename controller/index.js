let dotenv = require("dotenv").config();
let express = require("express");
let mongoose = require("mongoose");
let jwt = require("jsonwebtoken");
let http = require('http');
let path = require('path');
var session = require('express-session')
let cors = require('cors');
const PORT = process.env.PORT || "8080";

const secret = process.env.SECRET;

let app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
  app.use(cors());
  next();
});

app.set('views', path.join(__dirname, '../view'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({extended: false}));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
mongoose.set('strictQuery', true); // contornar aviso no terminal


// models
const User = require("../model/User");
const Publicacao = require("../model/Publicacao");

// Configurar resposta JSON
app.use(express.json());
mongoose.set('strictQuery', true);

app.get("/", (req, res) => {
  if(!req.session.views){
    req.session.views = 0;  
  }
  const views = req.session.views++;
  res.cookie('view', views, {maxAge: 3000})
  res.status(200)
  res.render('index')
});

// Rota privada
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // checa se user existe
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não existe" });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // divide no espaço e pega a segunda parte

  if (!token) return res.status(401).json({ msg: "Acesso negado" });

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (err) {
    res.status(400).json({ msg: "O Token é inválido" });
  }
}

// Registrar usuário
app.post("/auth/register", async (req, res) => {
  const { email, password, confirmpassword } = req.body;

  // validações
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  if (confirmpassword != password) {
    return res.status(422).json({ msg: "As senhas devem ser iguais" });
  }

  // checar se o usuário já existe
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Utilize outro e-mail" });
  }

  // criar user
  const user = new User({
    email,
    password,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});



// Login
app.post("/auth/login", async (req, res) => {
  //const { email, password} = req.body;
  const { email, password} = req.body;

  // validações
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  // checar se o usuário realmente existe
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não existe" });
  }

  // checar se a senha bate

  if (password != user.password) {
    return res.status(422).json({ msg: "Senha inválida" });
  }
  id = user._id
  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
    );

    res.status(200).json({ msg: "Autenticação realizada com sucesso", token, id });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
  
});

//  POST de reviews

// Registrar post
app.post("/post/register", async (req, res) => {
  
  const { title, year, rating, resenha } = req.body;

  // validações
  if (!title) {
    return res.status(422).json({ msg: "O título é obrigatório" });
  }

  if (!rating) {
    return res.status(422).json({ msg: "A nota é obrigatória" });
  }

  if (!resenha) {
    return res.status(422).json({ msg: "A resenha é obrigatória" });
  }
  // criar publicacao
  const publicacao = new Publicacao({
    title, year, rating, resenha, 
  });

  try {
    await publicacao.save();

    if(!req.session.post){
      req.session.post = 1;  
    }
    const posts = req.session.post++;
    res.cookie('qtdPosts', `${posts}`)

    res.status(201).json({ msg: "Post criado com sucesso"});
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});


// Rota pegar post
app.get("/post/:title", async (req, res) => {
  const titleq = req.params.title;

  // checa se user existe
  const publicacao = await Publicacao.find({title: {$regex:titleq, $options:'i'}});   // procurar relacionados e case insensitive

  if (!publicacao) {
    return res.status(404).json({ msg: "Publicação não existe" });
  }

  res.status(200).json({ publicacao });
});

// Dados do usuário
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@api-web.qgbcwof.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectou ao banco!");
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
