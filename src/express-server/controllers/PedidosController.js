/**
 * PedidosController.js
 */
const PedidosService = require('../services/PedidosService');

class PedidosController {
  async getPedidos(req, res) {
    try {
      const filters = { estado: req.query.estado };
      const pedidos = await PedidosService.list(filters);
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPedido(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const pedido = await PedidosService.getById(id);
      if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
      res.status(200).json(pedido);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createPedido(req, res) {
    try {
      const result = await PedidosService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePedido(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const result = await PedidosService.update(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Pedido não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deletePedido(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      await PedidosService.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Pedido não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PedidosController();
