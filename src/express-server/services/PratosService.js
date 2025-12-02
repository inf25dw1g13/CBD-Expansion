/**
 * Pratos Service
 */

const db = require('../utils/db');

class PratosService {

  /**
   * Listar pratos com filtros
   * @param {Object} filters - Filtros (restaurante_id, categoria_id, vegetariano)
   * @returns {Promise<Array>}
   */
  async list(filters = {}) {
    const { restaurante_id, vegetariano } = filters;

    // Query para listar pratos com filtros
    let sql = `
      SELECT p.*, r.nome as restaurante_nome
      FROM pratos p
      INNER JOIN restaurantes r ON p.restaurante_id = r.id
      WHERE p.disponivel = TRUE
    `;

    const params = [];

    if (restaurante_id) {
      sql += ' AND p.restaurante_id = ?';
      params.push(restaurante_id);
    }

    if (vegetariano === 'true') {
      sql += ' AND p.vegetariano = TRUE';
    }

    sql += ' ORDER BY p.created_at DESC, p.updated_at DESC, p.nome ASC LIMIT 50';

    return await db.query(sql, params);
  }

  /**
   * Obter prato por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    // Query para obter um prato por ID (com restaurante)
    const sql = `
      SELECT p.*, r.nome as restaurante_nome
      FROM pratos p
      INNER JOIN restaurantes r ON p.restaurante_id = r.id
      WHERE p.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Criar novo prato
   * @param {Object} data - Dados do prato
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      restaurante_id, nome, descricao, preco,
      tempo_preparacao, vegetariano, vegan, sem_gluten
    } = data;

    // Query para criar um novo prato
    const sql = `
      INSERT INTO pratos 
      (restaurante_id, nome, descricao, preco, 
       tempo_preparacao, vegetariano, vegan, sem_gluten)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(sql, [
      restaurante_id, nome, descricao || null, preco,
      tempo_preparacao || 20, vegetariano || false, vegan || false, 
      sem_gluten || false
    ]);

    return {
      success: true,
      message: 'Prato criado com sucesso',
      id: result.insertId
    };
  }

  /**
   * Atualizar prato
   * @param {number} id
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Prato não encontrado');
    }

    const updates = [];
    const params = [];

    if (data.nome !== undefined) {
      updates.push('nome = ?');
      params.push(data.nome);
    }

    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      params.push(data.descricao || null);
    }

    if (data.preco !== undefined) {
      updates.push('preco = ?');
      params.push(data.preco);
    }

    if (data.tempo_preparacao !== undefined) {
      updates.push('tempo_preparacao = ?');
      params.push(data.tempo_preparacao);
    }

    if (data.disponivel !== undefined) {
      updates.push('disponivel = ?');
      params.push(data.disponivel);
    }

    if (data.vegetariano !== undefined) {
      updates.push('vegetariano = ?');
      params.push(data.vegetariano);
    }

    if (data.vegan !== undefined) {
      updates.push('vegan = ?');
      params.push(data.vegan);
    }

    if (data.sem_gluten !== undefined) {
      updates.push('sem_gluten = ?');
      params.push(data.sem_gluten);
    }
    
    // restaurante_id não pode ser alterado (é imutável)
    
    if (updates.length === 0) {
      throw new Error('Nenhum campo fornecido para atualização');
    }
    
    params.push(id);
    
    // Query para atualizar o prato
    const sql = `UPDATE pratos SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.query(sql, params);

    return {
      success: true,
      message: 'Prato atualizado com sucesso'
    };
  }

  /**
   * Apagar prato
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Prato não encontrado');
    }

    const sql = 'DELETE FROM pratos WHERE id = ?';
    await db.query(sql, [id]);

    return {
      success: true,
      message: 'Prato removido com sucesso'
    };
  }

  /**
   * Obter ingredientes de um prato (Relação m:n)
   * @param {number} pratoId
   * @returns {Promise<Array>}
   */
  async getIngredientes(pratoId) {
    // Query para obter ingredientes de um prato
    const sql = `
      SELECT i.id, i.nome, i.unidade, pi.quantidade, pi.obrigatorio
      FROM ingredientes i
      INNER JOIN pratos_ingredientes pi ON i.id = pi.ingrediente_id
      WHERE pi.prato_id = ?
      ORDER BY i.nome
    `;
    
    return await db.query(sql, [pratoId]);
  }

  /**
   * Adicionar ingrediente a um prato (Relação m:n)
   * @param {number} pratoId
   * @param {number} ingredienteId
   * @param {number} quantidade
   * @returns {Promise<Object>}
   */
  async addIngrediente(pratoId, ingredienteId, quantidade) {
    // Query para adicionar ingrediente a um prato
    const sql = `
      INSERT INTO pratos_ingredientes (prato_id, ingrediente_id, quantidade)
      VALUES (?, ?, ?)
    `;
    
    await db.query(sql, [pratoId, ingredienteId, quantidade]);
    
    return {
      success: true,
      message: 'Ingrediente adicionado ao prato'
    };
  }

  /**
   * Remover ingrediente de um prato (Relação m:n)
   * @param {number} pratoId
   * @param {number} ingredienteId
   * @returns {Promise<Object>}
   */
  async removeIngrediente(pratoId, ingredienteId) {
    // Verificar se o prato existe
    const prato = await this.getById(pratoId);
    if (!prato) {
      throw new Error('Prato não encontrado');
    }

    // Query para verificar se o ingrediente está associado ao prato
    const checkSql = `
      SELECT * FROM pratos_ingredientes 
      WHERE prato_id = ? AND ingrediente_id = ?
    `;
    const existing = await db.query(checkSql, [pratoId, ingredienteId]);
    
    if (existing.length === 0) {
      throw new Error('Ingrediente não encontrado neste prato');
    }

    // Query para remover ingrediente de um prato
    const sql = `
      DELETE FROM pratos_ingredientes 
      WHERE prato_id = ? AND ingrediente_id = ?
    `;
    
    await db.query(sql, [pratoId, ingredienteId]);
    
    return {
      success: true,
      message: 'Ingrediente removido do prato'
    };
  }

  // Express handlers
  async getPratos(req, res) {
    try {
      const { restaurante_id, vegetariano } = req.query;
      const pratos = await this.list({ restaurante_id, vegetariano });
      res.json(pratos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPrato(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const prato = await this.getById(id);
      if (!prato) {
        return res.status(404).json({ error: 'Prato não encontrado' });
      }
      res.json(prato);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createPrato(req, res) {
    try {
      const result = await this.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePrato(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const result = await this.update(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Prato não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deletePrato(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      await this.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Prato não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Handlers para relação m:n com ingredientes
  async getIngredientesPrato(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const ingredientes = await this.getIngredientes(id);
      res.json(ingredientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addIngredientePrato(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const pratoId = parseInt(idParam);
      if (isNaN(pratoId) || pratoId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const { ingrediente_id, quantidade } = req.body;
      
      if (!ingrediente_id || !quantidade) {
        return res.status(400).json({ 
          error: 'ingrediente_id e quantidade são obrigatórios' 
        });
      }
      
      const result = await this.addIngrediente(pratoId, ingrediente_id, quantidade);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeIngredientePrato(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const pratoId = parseInt(idParam);
      if (isNaN(pratoId) || pratoId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const ingredienteId = parseInt(req.query.ingrediente_id || req.body.ingrediente_id);
      
      if (!ingredienteId || isNaN(ingredienteId)) {
        return res.status(400).json({ 
          error: 'ingrediente_id é obrigatório' 
        });
      }
      
      await this.removeIngrediente(pratoId, ingredienteId);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Prato não encontrado' || error.message === 'Ingrediente não encontrado neste prato') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PratosService();