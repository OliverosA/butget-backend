const Person = require('../models/person');
const { auth } = require('../config/config');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.registerPerson = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const hash_password = await bcryptjs.hash(password, 12);
    const args = { username, email, password: hash_password };
    await Person.register(args);
    res.status(200).json({ message: 'Person Created!' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

module.exports.loginPerson = async (req, res, net) => {
  const { email, password } = req.body;

  try {
    const args = { email };
    const { rows } = await Person.login(args);

    if (rows.length) {
      const person = rows[0];
      const isValidPassword = await bcryptjs.compare(
        password,
        person['PASSWORD']
      );
      if (isValidPassword) {
        const token = jwt.sign(person, auth.token);
        const data = [
          {
            person: person['PERSON'],
            username: person['USERNAME'],
            email: person['EMAIL'],
          },
        ];
        return res.status(200).json({ token, data });
      }
    }
    res.status(400).json({ message: 'Error: email or password not valid' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
