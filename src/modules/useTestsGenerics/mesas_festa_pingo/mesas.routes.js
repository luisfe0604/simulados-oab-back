const express = require('express');

const mesasController = require('./mesas.controller');

const router = express.Router();

router.get('/', mesasController.listarMesas);

router.post('/:id/reservar', mesasController.reservarMesa);

router.put('/:id', mesasController.atualizarMesa);

router.put('/limpar/:id', mesasController.limparMesa);

module.exports = router;