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
          const end = new Date().valueOf() - start;
          histogram.observe(end/1000);
          counter.inc();
          return res.status(201).json(todo);
        })
      })
      .catch(err => {
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(500).json(err.message)
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
        histogram.observe(end/1000);
        counter.inc();
        return res.status(200).json(todo);
      })
      .catch(err => {
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(500).json(err)
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
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(200).json(todo)
      })
      .catch(err => {
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(500).json(err)
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
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(200).json(todo)
      })
      .catch(err => {
        if (err.message && err.message === 'todo not found')
          return res.status(404).json(err);
        return res.status(500).json(err)
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
          const end = new Date().valueOf() - start;
          histogram.observe(end/1000);
          counter.inc();
          return res.status(200).json(result)
        })
      })
      .catch(err => {
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        if (err.message && err.message === 'todo not found, not action taken')
          return res.status(404).json(err)
        return res.status(500).json(err)
      })
  }
}

export default TodoController;
