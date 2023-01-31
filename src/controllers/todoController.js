import { users, todos } from '../model';
import { histogram, counter } from '../helpers'

class TodoController {
  static createTodo(req, res) {
    const start = new Date().valueOf();
    const todo = req.body;
    todo.completed = false;
    if (todo.deadline !== undefined && todo.deadline === 0) {
      delete todo.deadline;
    }
    return users
      .findById(req.body.userId)
      .then(user => {
        // create the todo item
        return todos
        .create(todo)
        .then(todo => {
          res.status(201).json(todo);
          const end = new Date().valueOf() - start;
          histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
          return counter.inc();
        })
      })
      .catch(err => {
        res.status(500).json(err.message)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
  }

  static getTodo(req, res) {
    const start = new Date().valueOf();
    let { id } = req.params;
    id = parseInt(id, 10)
    return todos
      .findById(id)
      .then(todo => {
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        counter.inc();
        return res.status(200).json(todo);
      })
      .catch(err => {
        res.status(500).json(err)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
  }

  static getTodos(req, res) {
    const start = new Date().valueOf();
    const { userId } = req.body;
    return todos
      .findAll({
        where: {
          userId,
        }
      })
      .then(todo => {
        res.status(200).json(todo)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
      .catch(err => {
        res.status(500).json(err)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      });
  }

  static  updateTodo(req, res) {
    const start = new Date().valueOf();
    let { id } = req.params;
    id = parseInt(id, 10);
    const updates = req.body;
    delete updates.userId;
    return todos.findById(id)
      .then(todo => {
        const update = {
          title: updates.title || todo.title,
          description: updates.description || todo.description,
          completed: updates.completed || todo.completed,
          links: updates.links || todo.links,
          deadline: updates.deadline || todo.deadline,
        }
        // remove fields with null
        const fields = Object.keys(update);
        fields.forEach(field => {
          if (update[field] === null) {
            delete update[field]
          }
        })
        return todos
        .update(
          update,
          {
            where: {
              id,
            }
          },
        )
      })
      .then(todo => {
        res.status(200).json(todo)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
      .catch(err => {
        if (err.message && err.message === 'todo not found'){
          res.status(404).json(err);
          const end = new Date().valueOf() - start;
          histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
          return counter.inc();
        }
        res.status(500).json(err)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      });
  }

  static deleteTodo(req, res) {
    const start = new Date().valueOf();
    let { id } = req.params;
    id = parseInt(id, 10);
    const { userId } = req.body;
    return users
      .findById(userId)
      .then(user => {
        return todos
        .destroy({
          where: {
            id,
            userId
          }
        })
        .then(result => {
          res.status(200).json(result)
          const end = new Date().valueOf() - start;
          histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
          return counter.inc();
        })
      })
      .catch(err => {
        if (err.message && err.message === 'todo not found, not action taken') {
          res.status(404).json(err)
          const end = new Date().valueOf() - start;
          histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
          return counter.inc();
        }
        res.status(500).json(err)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
  }
}

export default TodoController;
