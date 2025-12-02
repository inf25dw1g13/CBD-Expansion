/**
 * EntregasController.js
 */
const EntregasService = require('../services/EntregasService');

class EntregasController {
  async getEntregas(req, res) {
    try {
      const entregas = await EntregasService.list(req.query);
      res.status(200).json(entregas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEntrega(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const entrega = await EntregasService.getById(id);
      if (!entrega) return res.status(404).json({ error: 'Entrega não encontrada' });
      res.status(200).json(entrega);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEntrega(req, res) {
    try {
      const result = await EntregasService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEntrega(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const result = await EntregasService.update(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Entrega não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEntrega(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      await EntregasService.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Entrega não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new EntregasController();

