/**
 * RestaurantesController
 */

const RestaurantesService = require('../services/RestaurantesService');

class RestaurantesController {

  async getRestaurantes(req, res) {
    try {
      const filters = {
        limite: req.query.limite,
        especialidade: req.query.especialidade
      };

      const restaurantes = await RestaurantesService.list(filters);
      res.status(200).json(restaurantes);
    } catch (error) {
      console.error('Erro ao listar restaurantes:', error);
      res.status(500).json({ 
        error: 'Erro ao listar restaurantes',
        message: error.message 
      });
    }
  }

  async getRestaurante(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const restaurante = await RestaurantesService.getById(id);

      if (!restaurante) {
        return res.status(404).json({ 
          error: 'Restaurante não encontrado' 
        });
      }

      res.status(200).json(restaurante);
    } catch (error) {
      console.error('Erro ao obter restaurante:', error);
      res.status(500).json({ 
        error: 'Erro ao obter restaurante',
        message: error.message 
      });
    }
  }

  async getPratosRestaurante(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const pratos = await RestaurantesService.getPratos(id);
      res.status(200).json(pratos);
    } catch (error) {
      if (error.message === 'Restaurante não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createRestaurante(req, res) {
    try {
      const result = await RestaurantesService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao criar restaurante:', error);
      res.status(400).json({ 
        error: 'Erro ao criar restaurante',
        message: error.message 
      });
    }
  }

  async updateRestaurante(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      const result = await RestaurantesService.update(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      
      if (error.message === 'Restaurante não encontrado') {
        return res.status(404).json({ 
          error: error.message 
        });
      }

      res.status(400).json({ 
        error: 'Erro ao atualizar restaurante',
        message: error.message 
      });
    }
  }

  async deleteRestaurante(req, res) {
    try {
      const id = req.openapi?.pathParams?.id || req.params?.id;
      await RestaurantesService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao apagar restaurante:', error);
      
      if (error.message === 'Restaurante não encontrado') {
        return res.status(404).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Erro ao apagar restaurante',
        message: error.message 
      });
    }
  }
}

module.exports = new RestaurantesController();