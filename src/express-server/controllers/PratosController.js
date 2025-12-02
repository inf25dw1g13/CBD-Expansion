/**
 * Pratos Controller
 */

const PratosService = require('../services/PratosService');

class PratosController {

  async getPratos(req, res) {
    try {
      const filters = {
        restaurante_id: req.query.restaurante_id,
        categoria_id: req.query.categoria_id,
        vegetariano: req.query.vegetariano
      };

      const pratos = await PratosService.list(filters);
      res.status(200).json(pratos);
    } catch (error) {
      console.error('Erro ao listar pratos:', error);
      res.status(500).json({ 
        error: 'Erro ao listar pratos',
        message: error.message 
      });
    }
  }

  async getPrato(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const prato = await PratosService.getById(id);

      if (!prato) {
        return res.status(404).json({ 
          error: 'Prato não encontrado' 
        });
      }

      res.status(200).json(prato);
    } catch (error) {
      console.error('Erro ao obter prato:', error);
      res.status(500).json({ 
        error: 'Erro ao obter prato',
        message: error.message 
      });
    }
  }

  async getIngredientesPrato(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const pratoId = parseInt(id);
      if (isNaN(pratoId) || pratoId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const ingredientes = await PratosService.getIngredientes(pratoId);
      res.status(200).json(ingredientes);
    } catch (error) {
      if (error.message === 'Prato não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async addIngredientePrato(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const pratoId = parseInt(id);
      if (isNaN(pratoId) || pratoId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const { ingrediente_id, quantidade } = req.body;
      if (!ingrediente_id || !quantidade) {
        return res.status(400).json({ error: 'ingrediente_id e quantidade são obrigatórios' });
      }
      const result = await PratosService.addIngrediente(pratoId, ingrediente_id, quantidade);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Prato não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async removeIngredientePrato(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const pratoId = parseInt(id);
      if (isNaN(pratoId) || pratoId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const ingredienteId = parseInt(req.query.ingrediente_id || req.body.ingrediente_id);
      if (!ingredienteId || isNaN(ingredienteId)) {
        return res.status(400).json({ error: 'ingrediente_id é obrigatório' });
      }
      await PratosService.removeIngrediente(pratoId, ingredienteId);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Prato não encontrado' || error.message === 'Ingrediente não encontrado neste prato') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async createPrato(req, res) {
    try {
      const result = await PratosService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao criar prato:', error);
      res.status(400).json({ 
        error: 'Erro ao criar prato',
        message: error.message 
      });
    }
  }

  async updatePrato(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const result = await PratosService.update(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao atualizar prato:', error);
      
      if (error.message === 'Prato não encontrado') {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ 
        error: 'Erro ao atualizar prato',
        message: error.message 
      });
    }
  }

  async deletePrato(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      await PratosService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao apagar prato:', error);
      
      if (error.message === 'Prato não encontrado') {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Erro ao apagar prato',
        message: error.message 
      });
    }
  }
}

module.exports = new PratosController();