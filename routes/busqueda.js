var express = require('express');

var app = express();

var Hospital = require('../models/hospital')
var Medico = require('../models/medico')
var Usuario = require('../models/usuario')

// =======================
// Busqueda por Coleccion
// =======================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case "hospitales":
            console.log('dentro de hospital');
            promesa = buscarHospitales(busqueda, regex);
            break;
        case "medicos":
            promesa = buscarMedico(busqueda, regex);
            console.log('dentro del medico');
            break;
        case "usuarios":
            promesa = buscarUsuario(busqueda, regex);
            console.log('dentro del usuario');
            break;
        default:
            res.status(200).json({
                ok: false,
                mensaje: 'los tipos de busqueda son usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            mensaje: 'Peticion realizada correctamente',
            [tabla]: data // con los corchetes le digo al ecma script que no es el nombre sino el resultado de esa variable lo que quiero que agrege ahí
        });
    });

})


// =======================
// Busqueda General
// =======================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // creo una expresion regular para hacer la busqueda insensible a mayusculas

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedico(busqueda, regex),
            buscarUsuario(busqueda, regex)
        ])
        .then(respuesta => {

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });
        });
});


// LLamada original a partir de la cual se crea una promesa 
// Hospital.find({ nombre: regex }, (err, hospitales) => {
//     res.status(200).json({
//         ok: true,
//         mensaje: 'Peticion realizada correctamente',
//         hospitales: hospitales
//     })
// })

// crea procesos asincronos para esperar que todos respondan y retornar todo junto 

// esta es una promesa creada a partir de la busqueda de hospitales
function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email') // de esta forma obtengo quien creo el usuario
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            })
    })
}


function buscarMedico(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('error al cargar medicos', err);
            } else {
                resolve(medicos);
            }
        })
    })
}


function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })

    })
}



module.exports = app;