// punto de entrada a la aplicacion, con este archivo se comienza

// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// inicializar variables
var app = express();

// Body parser 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importacion de rutas 
var appRoutes = require('./routes/app')
var usuarioRoutes = require('./routes/usuario')
var loginRoutes = require('./routes/login')
var hopitalsRoutes = require('./routes/hospital')
var medicosRoutes = require('./routes/medico')
var busquedaRoutes = require('./routes/busqueda')
var uploadRoutes = require('./routes/upload')
var imagenesRoutes = require('./routes/imagen')

// conexion a base de dastos 
mongoose.connection.openUri('mongodb://localhost:27017/huertaDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos \x1b[32m%s\x1b[0m ', 'online');
})



// Rutas 
app.use('/usuario', usuarioRoutes)
app.use('/login', loginRoutes)
app.use('/hospital', hopitalsRoutes)
app.use('/medico', medicosRoutes)
app.use('/busqueda', busquedaRoutes)
app.use('/img', imagenesRoutes)
app.use('/upload', uploadRoutes)

app.use('/', appRoutes)

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})