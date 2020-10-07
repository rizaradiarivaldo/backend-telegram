const usersModel = require('../models/users');
const { success, failed, successWithMeta } = require('../helpers/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const fs = require('fs')
// const nodemailer = require('nodemailer')
const { privatekey } = require('../helpers/env');

const upload = require('../helpers/uploads')

const users = {
  register: (req, res) => {
    const body = req.body
    if (!body.name || !body.email || !body.password) {
      failed(res, [], 'Name, email or password is required!')
    } else {
      const name = body.name
      const nameSplit = name.split(' ')
      const data = {
        name: body.name,
        email: body.email.toLowerCase(),
        username: nameSplit.join(' '),
        password: bcrypt.hashSync(body.password, 10)
      }
      jwt.sign({
        data: data.email
      }, privatekey, { expiresIn: '200d' }, (err, response) => {
        if (err) {
          failed(res, [], err.message)
        } else {
          usersModel.getEmail(data.email)
            .then((result) => {
              if (result.length === 0) {
                const sendData = {
                    name: data.name,
                    email: data.email,
                    username: data.username,
                    password: data.password,
                    token: response
                  }
                usersModel.register(sendData)
                  .then((results) => {
                    success(res, results, 'Register success!')
                  })
                  .catch((err) => {
                    failed(res, [], err.message)
                  })
              } else {
                failed(res, [], 'Email is already registered!')
              }
            })
            .catch((err) => {
              failed(res, [], err.message)
            })
        }
      });
    }
  },

  login: (req, res) => {
    const body = req.body
    if (!body.email || !body.password) {
      failed(res, [], 'Email or password is required!')
    } else {
      const data = {
        email: req.body.email.toLowerCase(),
        password: req.body.password
      }
    usersModel.login(data)
      .then((result) => {
        const results = result[0]
        if (!results) {
          failed(res, [], 'Email not registered, please register')
        } else {
          const password = results.password
          const isMatch = bcrypt.compareSync(data.password, password)
          if (isMatch) {
            success(res, results, 'Login success!')
          } else {
            failed(res, [], 'Email or password is wrong!')
          }
        }
      }).catch((err) => {
        failed(res, [], err.message)
      });
    }
  },
  updateUser: (req, res) => {
    upload.single('image')(req, res, (err) => { 
      if(err){
        if(err.code === `LIMIT_FIELD_VALUE`){
          failed(res, [], `Image size is to big`)
        }else{
          failed(res, [], err) 
        }
      }else{
        const body = req.body
        const email = req.params.email
        usersModel.getEmail(email)
        .then ((response) => {
          const imageOld = response[0].image
          body.image = !req.file ? imageOld : req.file.filename
          if (body.image !== imageOld) {
            if (imageOld !== 'default.png') {
              fs.unlink(`src/uploads/${imageOld}`, (err) => {
                if (err) {
                  failed(res, [], err.message)
                } else {
                  usersModel.updateUser(body, email)
                  .then((result) => {
                    success(res, result, 'Update success')
                  })
                  .catch((err) => {
                    failed(res, [], err.message)
                  })
                }
              })
            } else {
              usersModel.updateUser(body, email)
                .then((result) => {
                  success(res, result, 'Update success')
                })
                .catch((err) => {
                  failed(res, [], err.message)
                })
            }
          } else {
            usersModel.updateUser(body, email)
              .then((result) => {
                success(res, result, 'Update success')
              })
              .catch((err) => {
                failed(res, [], err.message)
              })
          }
        })
      }
    })

  },
}

module.exports = users
