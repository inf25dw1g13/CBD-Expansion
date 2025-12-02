/**
 * Restaurantes Service
 */

const db = require('../utils/db');

class RestaurantesService {
  
  /**
   * Listar restaurantes com filtros
   * @param {Object} filters - Filtros (especialidade)
   * @returns {Promise<Array>}
   */
  async list(filters = {}) {
    const { especialidade } = filters;
    
    // Query para listar restaurantes com filtros
    let sql = `
      SELECT id, nome, morada, telefone, especialidade, 
             tempo_medio_preparacao, taxa_entrega, pedido_minimo, ativo
      FROM restaurantes 
      WHERE ativo = TRUE
    `;
    
    const params = [];
    
    if (especialidade) {
      sql += ' AND especialidade = ?';
      params.push(especialidade);
    }
    
    sql += ' ORDER BY created_at DESC, updated_at DESC, nome ASC LIMIT 100';
    
    return await db.query(sql, params);
  }

  /**
   * Obter restaurante por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    // Query para obter um restaurante por ID
    const sql = 'SELECT * FROM restaurantes WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Criar novo restaurante
   * @param {Object} data - Dados do restaurante
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      nome, morada, telefone, especialidade, taxa_entrega, pedido_minimo,
      tempo_medio_preparacao
    } = data;

    // Query para criar um novo restaurante
    const sql = `
      INSERT INTO restaurantes 
      (nome, morada, telefone, especialidade, taxa_entrega, pedido_minimo, tempo_medio_preparacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(sql, [
      nome, morada, telefone || null, especialidade,
      taxa_entrega || 0, pedido_minimo || 0, tempo_medio_preparacao || 30
    ]);

    return {
      success: true,
      message: 'Restaurante criado com sucesso',
      id: result.insertId
    };
  }

  /**
   * Atualizar restaurante
   * @param {number} id
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    // Verificar se existe
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Restaurante não encontrado');
    }

    const {
      nome, morada, telefone, especialidade, taxa_entrega, pedido_minimo,
      tempo_medio_preparacao, ativo
    } = data;

    // Construir query dinamicamente baseado nos campos fornecidos
    const updates = [];
    const params = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      params.push(nome);
    }
    if (morada !== undefined) {
      updates.push('morada = ?');
      params.push(morada);
    }
    if (telefone !== undefined) {
      updates.push('telefone = ?');
      params.push(telefone);
    }
    if (especialidade !== undefined) {
      updates.push('especialidade = ?');
      params.push(especialidade);
    }
    if (taxa_entrega !== undefined) {
      updates.push('taxa_entrega = ?');
      params.push(taxa_entrega);
    }
    if (pedido_minimo !== undefined) {
      updates.push('pedido_minimo = ?');
      params.push(pedido_minimo);
    }
    if (tempo_medio_preparacao !== undefined) {
      updates.push('tempo_medio_preparacao = ?');
      params.push(tempo_medio_preparacao);
    }
    if (ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(ativo);
    }
    
    if (updates.length === 0) {
      throw new Error('Nenhum campo fornecido para atualização');
    }
    
    params.push(id);
    
    // Query para atualizar o restaurante
    const sql = `UPDATE restaurantes SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.query(sql, params);

    return {
      success: true,
      message: 'Restaurante atualizado com sucesso'
    };
  }

  /**
   * Apagar restaurante
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    // Verificar se existe
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Restaurante não encontrado');
    }

    // Query para eliminar um restaurante
    const sql = 'DELETE FROM restaurantes WHERE id = ?';
    await db.query(sql, [id]);

    return {
      success: true,
      message: 'Restaurante removido com sucesso'
    };
  }

  /**
   * Obter pratos de um restaurante (Relação 1:n)
   * @param {number} restauranteId
   * @returns {Promise<Array>}
   */
  async getPratos(restauranteId) {
    // Verificar se o restaurante existe
    const restaurante = await this.getById(restauranteId);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }
    
    // Query para obter os pratos de um restaurante
    const sql = `
      SELECT p.*
      FROM pratos p
      WHERE p.restaurante_id = ? AND p.disponivel = TRUE
      ORDER BY p.created_at DESC, p.updated_at DESC, p.nome ASC
    `;
    
    return await db.query(sql, [restauranteId]);
  }

  // Express handlers
  async getRestaurantes(req, res) {
    try {
      const { especialidade } = req.query;
      const restaurantes = await this.list({ especialidade });
      res.json(restaurantes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRestaurante(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const restaurante = await this.getById(id);
      if (!restaurante) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      res.json(restaurante);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createRestaurante(req, res) {
    try {
      const result = await this.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRestaurante(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const result = await this.update(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Restaurante não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRestaurante(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      await this.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Restaurante não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getPratosRestaurante(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const pratos = await this.getPratos(id);
      res.json(pratos);
    } catch (error) {
      if (error.message === 'Restaurante não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RestaurantesService();