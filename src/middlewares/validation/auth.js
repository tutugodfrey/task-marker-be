export default {
  signup: (req, res, next) => {
    let count = 0
    let validations = []
    const fields = ['password', 'confirmPassword', 'name', 'email', 'username'];
    fields.forEach(field => {
      if (!req.body[field]) {
        validations.push({
          field,
          message: `${field} is required to sign up`
        })
      }
      count++
    });

    if (validations.length > 0){
      return res.status(400).json(validations)
    }

    // check that all fields are validated 
    if (fields.length === count) {
      if (req.body['password'] !== req.body['confirmPassword'])
        return res.status(401).json({ message: 'Passwords does not match' })
      return next();
    }
  },
  signin: (req, res, next) => {
    let count = 0
    const fields = ['password', 'username'];
    fields.forEach(field => {
      if (!req.body[field]) 
      return res.status(400).json({
        message:  `${field} is required to sign in`, 
      });
      count++
    });

    // check that all fields are validated 
    if (fields.length === count) {
      return next();
    }
  },
};
