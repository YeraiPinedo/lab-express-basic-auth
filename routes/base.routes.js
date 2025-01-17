const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt")
const bcryptSalt = 10

const User = require('./../models/user.model')

// Endpoints
router.get('/', (req, res) => res.render('pages/index'))

router.get('/registro', (req, res) => res.render('pages/signup-form'))

router.post('/registro', (req, res) => {

    const { username, pwd } = req.body

    if (username.length === 0 || pwd.length === 0) {
        res.render('pages/signup-form', { errorMessage: 'Rellena los campos' })
        return
    }

    if (pwd.length < 2) {
        res.render('pages/signup-form', { errorMessage: 'Elige una contraseña más segura, ¡merluzo!' })
        return
    }

    User
        .findOne({ username })
        .then(user => {
            if (user) {
                res.render('pages/signup-form', { errorMessage: 'Nombre de usuario ya registrado' })
                return
            }

            const salt = bcrypt.genSaltSync(bcryptSalt)
            const hashPass = bcrypt.hashSync(pwd, salt)

            User
                .create({ username, password: hashPass })
                .then(() => res.redirect('/'))
                .catch(err => console.log('error', err))
        })
        .catch(err => console.log('error', err))
})

// Login

router.get('/inicio-sesion', (req, res) => res.render('pages/login-form'))

router.post('/inicio-sesion', (req, res) => {

    const { username, pwd } = req.body

    User
        .findOne({ username })
        .then(user => {

            if (!user) {
                res.render('pages/login-form', { errorMessage: 'Usuario no reconocido' })
                return
            }

            if (bcrypt.compareSync(pwd, user.password) === false) {
                res.render('pages/login-form', { errorMessage: 'Contraseña incorrecta' })
                return
            }

            req.session.currentUser = user
            console.log('Tengo aqui el usuario!', req.session)
            res.redirect('/')
        })
        .catch(err => console.log('error', err))
})

router.get('/cerrar-sesion', (req, res) => {
    req.session.destroy((err) => res.redirect("/iniciar-sesion"));
})

// DETECTOR SESION
router.use((req, res, next) => req.session.currentUser ? next() : res.redirect('/inicio-sesion'))

// PRIVATE ROUTES
router.get('/main', (req, res) => {
    res.render('pages/main-page', req.session.currentUser)
})

router.get('/private', (req, res) => {
    res.render('pages/private-page', req.session.currentUser)
})

module.exports = router


