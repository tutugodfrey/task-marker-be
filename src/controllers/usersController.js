import { users } from '../model';
import bcrypt from 'bcryptjs';
import { genToken, histogram, counter } from '../helpers';

class UsersController  {
  static signUp(req, res)  {
    const start = new Date().valueOf();
    const saltRounds = 10;
    const { password } = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    req.body.password = hash;
    delete req.body.confirmPassword;
    req.body.imgUrl = req.body.imgUrl || ''
    return users
      .create(req.body)
      .then(async (user) =>  {
        const { name, username, email, id, imgUrl } = user;
        const token = await genToken({
          id,
          name,
          email,
          username,
        });

        res.status(201).json({
          id,
          name,
          email,
          username,
          token,
          imgUrl,
        });
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        counter.inc();
      })
      .catch(err => {
        res.status(500).send(err)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        counter.inc();
      });
  };

  static signIn(req, res) {
    const start = new Date().valueOf();
    // user with username and password
    const { username, password } = req.body;
    return users
      .find({
        where: {
          username
        }
      })
      .then(async user => {
        const verifyUser = bcrypt.compareSync(password, user.password);
        const { name, username, email, id, imgUrl } = user;
        if (verifyUser) {
          const token = await genToken({
            id,
            name,
            username,
            email,
          })
          res.status(200).json({
            id,
            name,
            username,
            email,
            imgUrl,
            token
          })
          const end = new Date().valueOf() - start;
          histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
          return counter.inc();
        }
        res.status(404).json({ message: 'user not found' });
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
      .catch(err => {
        if(err.message && err.message === 'user not found') {
          res.status(404).send(err)
          const end = new Date().valueOf() - start;
          histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
          return counter.inc();
        };
        res.status(500).send(err);
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      });
  }

  static updateUser(req, res) {
    const start = new Date().valueOf();
    let { userId } = req.body;
    const update = { ...req.body };
    delete update.userId;
    return users
      .update(
        update,
        {
          where: {
            id: userId
          }
        },
      )
      .then(user => {
        const user_ = { ...user }
        delete user_.password;
        res.status(200).json(user_)
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
      .catch(err => res.status(500).json(err))
  }

  static getUsers(req, res) {
    const start = new Date().valueOf();
    return users
      .findById(req.body.userId)
      .then(result => {
        if (!result.isAdmin) return res.status(401).json({
          message: 'Access denied! Only an admin can view all users'
        });
        return users
          .findAll()
          .then(allUsers => {
            const result = allUsers.map(user_ => {
              const user = { ...user_ };
              delete user.password
              return user
            })
            res.status(200).json(result)
            const end = new Date().valueOf() - start;
            histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
            return counter.inc();
          })
      })
      .catch(error => res.status(500).json(error))
  }

  static getUser(req, res) {
    const start = new Date().valueOf();
    let { userId } = req.body;
    return users
    .findById(userId)
    .then(user => {
      const retrievedUser = { ...user }
      delete retrievedUser.password;
      res.status(200).json(retrievedUser);
      const end = new Date().valueOf() - start;
      histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
      return counter.inc();
    })
    .catch(error => {
      res.status(500).json(error)
      const end = new Date().valueOf() - start;
      histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
      return counter.inc();
    })
  }

  static deleteUser(req, res) {
    const start = new Date().valueOf();
    let { id } = req.params;
    return users
      .destory({
        id,
      })
      .then(res => {
        res.status(200).json({
          message: 'user successfully deleted'
        });
        const end = new Date().valueOf() - start;
        histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
        return counter.inc();
      })
      .catch(err => {
        if (err.message && err.message === 'user not found') {
          res.status(404).json(err);
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

  static uploadPhoto(req, res) {
    const start = new Date().valueOf();
    const { profilePhoto, userId } = req.body;
    return users
    .update(
      {
        imgUrl: profilePhoto || ''
      },
      {
      where: {
        id: userId
      }
    }
    )
    .then(user => {
      const user_ = { ...user }
      delete user_.password;
      res.status(200).json(user_)
      const end = new Date().valueOf() - start;
      histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
      return counter.inc();
    })
    .catch(err => {
      res.status(500).json(err)
      const end = new Date().valueOf() - start;
      histogram.labels({method: req.method, path: req.path, status: res.statusCode, message: res.statusMessage}).observe(end/1000);
      return counter.inc();
    })
  }
}

export default UsersController;
