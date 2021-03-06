var express = require('express');
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');


var mdAutenticacion = require('../middlewares/autenticacion')
var app = express();

var Hospital = require('../models/hospital')

// ============================
// Obtener todos los hospitales
// ============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // si no viene un parametro pone un cero
    desde = Number(desde);

    Hospital.find({}, )
        .skip(desde) // le digo a mongoose que se salte los primeros cinco registros
        .limit(5)
        .populate('usuario', 'nombre email') // para traer los datos del usario 
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    })
                }
                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    })
                })
            }
        )
});

// ============================
// Crear un nuevo hospital
// ============================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    })
})

// ============================
// Actualizar Hospital
// ============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese id' }
            })
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err

                })
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        })
    })
})

// ============================
// Borrar hospital
// ============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            })
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
})

module.exports = app;