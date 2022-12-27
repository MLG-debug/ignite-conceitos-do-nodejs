const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  if (!user) return response.status(404).send({ error: 'User not found' });
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.some(u => u.username === username)
  if (userExists) return response.status(400).send({ error: "User already exists." })
  const newUser = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  }
  users.push(newUser);
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todos = user.todos
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todo = user.todos.find(t => t.id === id)
  if (!todo) return response.status(404).json({ error: "Todo not found." })
  todo.title = title || todo.title;
  todo.deadline = deadline || todo.deadline;
  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(t => t.id === id)
  if (!todo) return response.status(404).json({ error: "Todo not found." })
  todo.done = true;
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(t => t.id === id)
  if (!todo) return response.status(404).json({ error: "Todo not found." })
  const todoIndex = user.todos.findIndex(t => t.id === id)
  user.todos.splice(todoIndex, 1)
  return response.status(204).json(user.todos)
});

module.exports = app;