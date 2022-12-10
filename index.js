require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let http = require('http'),
    path = require('path')

const app = express();

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

mongoose.set('strictQuery', true); // contornar aviso no terminal

// models
const User = require("./model/User");
//const Publicacao = require("./model/Publicacao");

// Configurar resposta JSON
app.use(express.json());
mongoose.set('strictQuery', true);

// Rota aberta
app.get("/", (req, res) => {
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

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
    );

    res.status(200).json({ msg: "Autenticação realizada com sucesso", token });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
  
});

// Dados do usuário
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@api-web.qgbcwof.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectou ao banco!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
