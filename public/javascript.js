var deixaLogar = new Boolean(false);
var validou = new Boolean(false);
var ehAdmGlobal = new Boolean(false);
let resposta;
var API_KEY = "k_ixjet3x4"; // API IMDB - 1000 acessos   k_wcarsm20
var API_URL = 'https://imdb-api.com/API/SearchTitle/' + API_KEY + '/';
var temconta = new Boolean(true);
var urlAPI = 'http://localhost:3000';
let msgErro;
let msgErroResenha;
let idAdm = '63948344b0a0ede1d0d73a29';

document.querySelector("#confirmasenha").style.display = "none";
document.querySelector("#labelconfirma").style.display = "none";
document.querySelector("#botaoResenha").style.display = "none";
document.querySelector("#PesquisaResenha").style.display = "none";
document.querySelector("#PesquisaFilmes").style.display = "none";

function voltar() {
  window.history.back();
}

function erroValidacao() {
  erro = document.querySelector("#erroValidacao");
  erro.innerHTML = `<p>${msgErro}</p>`
  if (validou == true) {
    document.querySelector("#erroValidacao").style.display = "none"; // some a mensagem de erro
    document.querySelector(".botaoEntrar").style.display = "none"; // some o botão de entrar
    document.querySelector(".botaoAssine").style.display = "none"; // some o botão de assine
    document.querySelector(".seta").style.display = "none"; // some a seta
    document.querySelector("#PesquisaFilmes").style.display = "block" // aparece a pesquisa
    document.querySelector("#PesquisaResenha").style.display = "block";
    voltar();
  }
  else {
    document.querySelector("#erroValidacao").style.display = "block";
  }
}

function erroResenha() {
  erro = document.querySelector("#erroValidacaoResenha");
  erro.style.display = "block";
  erro.innerHTML = `<p>${msgErroResenha}</p>`
}

function pegarToken() {
  if (deixaLogar == true) {
    // Login
    fetch(urlAPI + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: document.querySelector('#cemail').value,
        password: document.querySelector('#cpassword').value
      })
    }).then(res => {
      return res.json()
    })
      .then(data => {
        localStorage.setItem("token", data.token);

        if(data.id == idAdm){
          ehAdm = true
          postModal();
        }
        else{
          ehAdm = false
        }

        if (localStorage.getItem("token") != "undefined") {
          validou = true;
        }
        msgErro = data.msg
      })
      .catch(error => console.log('ERROR')) 
/*
      //verificar se é adm
  fetch(urlAPI + `/user/${idAdm}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
  }).then(res => {
      ehAdm = true;
      postModal();
      return res.json()
  })
    .then(data => {
      ehAdm = false
      msgErro = data.msg
    })
    .catch(error => console.log('ERROR')) */
  }
}

function criarLogin() {
  fetch(urlAPI + '/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: document.querySelector('#cemail').value,
      password: document.querySelector('#cpassword').value,
      confirmpassword: document.querySelector('#confirmasenha').value
    })
  }).then(res => {
    return res.json()
  })
    .then(data => {
      msgErro = data.msg
      console.log(msgErro)
    })
    .catch(error => console.log('ERROR'))
}

function erroEscrita() {   // FAZER comparar senhas, respostas dos erros FRONT-END, tirar TODOS os console.log
  if (document.querySelector("#cemail").value.length < 3 ||
    document.querySelector("#cpassword").value.length < 3 ||
    document.querySelector("#cpassword").value.length < 3) {
    document.querySelector("#erroEscrita").style.display = "block";
    deixaLogar = false;
  }
  else {
    document.querySelector("#erroEscrita").style.display = "none";
    deixaLogar = true;
  }
}


function validarLogin() {
  erroEscrita();
  pegarToken();
  setTimeout(erroValidacao, 500); // executar em 500ms
}

function validarRegistro() {
  erroEscrita();
  criarLogin();
  setTimeout(erroValidacao, 500); // executar em 500ms
}

function validar() {
  if (temconta == true) {
    validarLogin();
  }
  else {
    validarRegistro();
  }
}

function jaLogado() {

  if (localStorage.getItem("token") != null || localStorage.getItem("token") != undefined) {
    validou = true;
  }
  if (validou == true) {
    document.querySelector("#erroValidacao").style.display = "none"; // some a mensagem de erro
    document.querySelector(".botaoEntrar").style.display = "none"; // some o botão de entrar
    document.querySelector(".botaoAssine").style.display = "none"; // some o botão de assine
    document.querySelector(".seta").style.display = "none"; // some a seta
    document.querySelector("#PesquisaFilmes").style.display = "block" // aparece a pesquisa
    document.querySelector("#PesquisaResenha").style.display = "block" // aparece a pesquisa
  }
}

function deletarFilho() {
  var e = document.querySelector(".displayFilmes");
  var first = e.firstElementChild;
  var f = document.querySelector(".displayPosts");
  var second = f.firstElementChild;
  while (first) {
    console.log("FILMEEEE");
    first.remove();
    first = e.firstElementChild;
  }
  while (second) {
    console.log("RESENHAAAA");
    second.remove();
    second = f.firstElementChild;
  }
}

function pesquisarFilme() {
  deletarFilho();
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  fetch(API_URL + document.querySelector("#textoPesquisa").value, requestOptions)
    .then(response => response.text())
    .then(result => {
      resposta = JSON.parse(result)
      for (var i = 0; i < resposta.results.length; i++) {
        var obj = resposta.results[i]
        var a1 = document.createElement('div')
        a1.className = "container"
        a1.innerHTML = '<div class="caixaFilme"><div class="Poster"><img class="Poster" src=' + obj.image + ' alt="Poster"></div><div id="Titulo"><span>' + obj.title + '</span></div><div id="Descricao"><span>' + obj.description + '</span></div></div>'
        document.querySelector(".displayFilmes").appendChild(a1)
      }
    })
    .catch(error => console.log('error', error));
}

function naoTemLogin() {
  temconta = !temconta
  toggleLoginRegister()
}

function toggleLoginRegister() {
  var a1 = document.querySelector('#botaoLogin')
  var a2 = document.querySelector('#naoTemConta')
  if (temconta == false) {
    a1.innerHTML = '<p>REGISTRAR</p>'
    a2.innerHTML = '<p id="naoTemConta">Já tem uma conta? Faça login</p>'
    document.querySelector("#confirmasenha").style.display = "block";
    document.querySelector("#labelconfirma").style.display = "block";
    //chama o método de criar conta
  }
  if (temconta == true) {
    a1.innerHTML = '<p>ENTRAR</p>'
    a2.innerHTML = '<p id="naoTemConta">Não tem um conta? Registre-se</p>'
    document.querySelector("#confirmasenha").style.display = "none";
    document.querySelector("#labelconfirma").style.display = "none";

    //chama o método de login
  }
}

function postModal() { //Habilita o modal de cadastro de publicacao
  if (ehAdm === true) {
    document.querySelector("#botaoResenha").style.display = "block";
  }
  else {
    document.querySelector("#botaoResenha").style.display = "none";
  }
}

// Pesquisar Resenha
function pesquisarResenha() {
  title = document.querySelector("#textoPesquisaResenha").value

  deletarFilho();

  fetch(urlAPI + `/post/${title}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => {
    return res.json()
  })
    .then(data => {
      gerarPostagem(data);
      msgErro = data.msg
    })
    .catch(error => console.log('ERROR'))
}

function criarPostagem() {
  fetch(urlAPI + '/post/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: document.querySelector('#ctitulo').value,
      year: document.querySelector('#cano').value,
      rating: document.querySelector('#cnota').value,
      resenha: document.querySelector('#cresenha').value
    })
  }).then(res => {
    return res.json()
  })
    .then(data => {
      msgErroResenha = data.msg
      console.log(msgErroResenha)
      erroResenha()
    })
    .catch(error => console.log('ERROR'))
}


function gerarPostagem(data) {
  for (var i = 0; i < data.publicacao.length; i++) {
    var obj = data.publicacao[i]
    if (data.publicacao[i].year == null) {
      data.publicacao[i].year = "N/A"
    }
    var a1 = document.createElement("div")
    a1.className = "containerPost"
    a1.innerHTML = `<div class="caixaPostagem"><p class="titulo">${data.publicacao[i].title} (${data.publicacao[i].year})</p><p class="nota">Nota: ${data.publicacao[i].rating}</p><p class="resenha">${data.publicacao[i].resenha}</p></div>`
    document.querySelector(".displayPosts").appendChild(a1)
  }
}

document.querySelector("#botaoPesquisaFilme").addEventListener('click', () => {
  pesquisarFilme();
})

document.querySelector("#botaoPesquisaResenha").addEventListener('click', () => {
  pesquisarResenha();
})

// esse é o botão de fazer o login efetivamente
document.querySelector("#botaoLogin").addEventListener('click', () => {
  validar();
})

document.querySelector(".fechar").addEventListener('click', () => {
  voltar();
})

document.querySelector(".botaoEntrar").addEventListener('click', () => {
  jaLogado();
})

document.querySelector("#textoPesquisa").addEventListener('keydown', (event) => {
  if (event.keyCode == 13) {
    pesquisarFilme();
  }
})

document.querySelector("#naoTemConta").addEventListener('click', () => {
  naoTemLogin();
})

document.querySelector("#botaoPublicar").addEventListener('click', () => {
  criarPostagem();
})



// APAGAR DEPOIS

function apagarToken() {
  localStorage.clear();
  document.location.reload(true);
}