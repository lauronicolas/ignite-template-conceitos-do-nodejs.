const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

const users = [];



function checksExistsUserAccount(request, response, next) {
  //Recebe o username pelo header params
  const { username } = request.headers;

  //procuramos se existe um user com o username informado
  const user = users.find(user => user.username === username);

  //Se não existir, repondemos que não existe
  if (!user) {
    return response
      .json({
        error: "User does not exist"
      })
      .status(404);
  }

  //Passamos o usuario encontrado através do request
  request.user = user;

  //retornamos à rota inicial
  return next();

}

app.post('/users', (request, response) => {
  //Recebe os parametros pelo body da request
  const { name, username } = request.body;

  //analisamos nosso array se ja existe um 'username' no qual o usuario queira fazer o cadastro
  const verifyIdExistUsername = users.find(user => user.username === username);

  //Se existir retornamos uma mensagem pro usuario
  if (verifyIdExistUsername) {
    return response.status(400).json({
      error: "Username already exists"
    });
  }

  //criamos um objeto user com todos os dados que precisamos
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  //Adiciona o usuario na lista de usuarios
  users.push(user);

  return response.json(user).status(201);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  //recebemos do middleware um user que existe na nossa lisat de usuarios
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  //Recebe o usuario encontrado no middleware
  const { user } = request;

  //Informações passadas pelo body da requisição
  const { title, deadline } = request.body;

  //Objeto todo completo para ser adicionado na lista de todos
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    //transformamos a data recebida pelo body em uma data reconhecida pelo JS
    deadline: new Date(deadline),
    created_at: new Date()
  }

  //Adiciona o Todo criado na lista de todos
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  //Usuario existente
  const { user } = request;

  //Body Params
  const { title, deadline } = request.body;

  //Query Params
  const { id } = request.query;

  //Encontra o todo com id recebido do query params
  const todo = user.todos.find(todo => user.todos.id === id);

  //Verifica se foi encontrado algum todo com o id recebido
  if (!todo) {
    return response.status(404).json({
      error: "Todo does not exist"
    })
  }
  //altera o title
  todo.title = title;

  //altera o deadline ja transformando para formato de data do JS
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  //Usuario existente
  const { user } = request;

  //Query Params
  const { id } = request.query;

  //Encontra o todo com id recebido do query params
  const todo = user.todos.find(todo => user.todos.id === id);

  //Verifica se foi encontrado algum todo com o id recebido
  if (!todo) {
    return response.status(404).json({
      error: "Todo does not exist"
    })
  }

  //altera 'done' para true
  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  //Usuario existente
  const { user } = request;

  //Query Params
  const { id } = request.query;

  //Encontra o todo com id recebido do query params
  const todo = user.todos.find(todo => user.todos.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo does not exist"
    })
  }

  //Busca o index do todo encontrado no todo list
  const indexTodo = user.todos.indexOf(todo, 0);

  //remove da todolist com o index encontrado
  user.todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;