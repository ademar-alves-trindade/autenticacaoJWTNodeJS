require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

const cors = require('cors');


const app = express();
// Config JSON response
app.use(express.json());
// Config Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//config Cors
app.use(cors());

// models
const User = require("./models/User");

// Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a API!" });
});


// Private Route
app.get("/user/:id",  checkToken, async (req, res) => {
  const id = req.params.id;

  // check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader);
  console.log(token);

  if (!token) return res.status(401).json({ msg: "Acesso negado!" });

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);

    //decode subject
    const decoded = jwt.decode(token);
     // Anexar o campo "sub" ao objeto req para uso posterior.
     if (decoded && decoded.sub) {
      req.subject = decoded.sub;
    }
    console.log("RESPOSTA",decoded);
    next();
  } catch (err) {
    res.status(400).json({ msg: "O Token é inválido!" });
  }
}

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  // validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password != confirmpassword) {
    return res
      .status(422)
      .json({ msg: "A senha e a confirmação precisam ser iguais!" });
  }

  // check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Validações
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // Verificar se o usuário existe
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  // Verificar se a senha corresponde
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }
  try {
    const secret = process.env.SECRET;

    // Obter a hora atual e calcular a hora de expiração (por exemplo, 1 hora a partir de agora)
    const currentTimestamp = Date.now();
    const expirationTimestamp = currentTimestamp + 60 * 60 * 1000; // 1 hora em milissegundos
    
    // Criar a payload com id, name, email e claims adicionais
    const payload = {
      property: user._id, // Emissor do token (substitua com sua entidade)
      emit: currentTimestamp,        // Timestamp de emissão
      exp: expirationTimestamp, // Timestamp de expiração
      "subject": {
        sub: user._id,  
        name: user.name, 
        email: user.email  
      }           
    };

 
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });


    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
    console.log("CONTEÚDO DO TOKEN", token);
    
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});


// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.e8bpqbo.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectou ao banco!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));

