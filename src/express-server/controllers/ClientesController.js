/**
 * ClientesController.js
 */
const ClientesService = require('../services/ClientesService');

class ClientesController {
  async getClientes(req, res) {
    try {
      const clientes = await ClientesService.list();
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCliente(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const cliente = await ClientesService.getById(id);
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
      res.status(200).json(cliente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCliente(req, res) {
    try {
      const result = await ClientesService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCliente(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const result = await ClientesService.update(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCliente(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      await ClientesService.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ClientesController();

