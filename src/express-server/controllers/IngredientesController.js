/**
 * IngredientesController.js
 */
const IngredientesService = require('../services/IngredientesService');

class IngredientesController {
  async getIngredientes(req, res) {
    try {
      const ingredientes = await IngredientesService.list({ alergeno: req.query.alergeno });
      res.status(200).json(ingredientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getIngrediente(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const ingrediente = await IngredientesService.getById(id);
      if (!ingrediente) return res.status(404).json({ error: 'Ingrediente não encontrado' });
      res.status(200).json(ingrediente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createIngrediente(req, res) {
    try {
      const result = await IngredientesService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateIngrediente(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const result = await IngredientesService.update(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Ingrediente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteIngrediente(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      await IngredientesService.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Ingrediente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new IngredientesController();

