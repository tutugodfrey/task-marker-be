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
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(201).json({
          id,
          name,
          email,
          username,
          token,
          imgUrl,
        });
      })
      .catch(err => res.status(500).send(err));
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
          return res.status(200).json({
            id,
            name,
            username,
            email,
            imgUrl,
            token
          })
        }
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(404).json({ message: 'user not found' });
      })
      .catch(err => {
        if(err.message && err.message === 'user not found') {
          return res.status(404).send(err)
        };
        return res.status(500).send(err);
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
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(200).json(user_)
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
            const end = new Date().valueOf() - start;
            histogram.observe(end/1000);
            counter.inc();
            return res.status(200).json(result)
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
      const end = new Date().valueOf() - start;
      histogram.observe(end/1000);
      counter.inc();
      return res.status(200).json(retrievedUser);
    })
    .catch(error => res.status(500).json(error))
  }

  static deleteUser(req, res) {
    const start = new Date().valueOf();
    let { id } = req.params;
    return users
      .destory({
        id,
      })
      .then(res => {
        const end = new Date().valueOf() - start;
        histogram.observe(end/1000);
        counter.inc();
        return res.status(200).json({
          message: 'user successfully deleted'
        });
      })
      .catch(err => {
        if (err.message && err.message === 'user not found')
          return res.status(404).json(err);
        return res.status(500).json(err)
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
      const end = new Date().valueOf() - start;
      histogram.observe(end/1000);
      counter.inc();
      return res.status(200).json(user_)
    })
    .catch(err => res.status(500).json(err))
  }
}

export default UsersController;
