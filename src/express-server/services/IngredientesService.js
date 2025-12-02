/**
 * Ingredientes Service
 */

const db = require('../utils/db');

class IngredientesService {

  async list(filters = {}) {
    const { alergeno } = filters;
    
    // Query para listar ingredientes com filtros
    let sql = `
      SELECT id, nome, unidade, alergeno, created_at
      FROM ingredientes
      WHERE 1=1
    `;
    
    const params = [];
    
    if (alergeno !== undefined) {
      sql += ' AND alergeno = ?';
      params.push(alergeno === 'true' || alergeno === true);
    }
    
    sql += ' ORDER BY created_at DESC, nome ASC';
    
    return await db.query(sql, params);
  }

  async getById(id) {
    // Query para obter um ingrediente por ID
    const sql = 'SELECT * FROM ingredientes WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data) {
    const { nome, unidade, alergeno } = data;

    // Validar unidade
    const unidadesValidas = ['g', 'kg', 'ml', 'l', 'unidade', 'fatia'];
    const unidadeFinal = unidade && unidadesValidas.includes(unidade) ? unidade : 'g';

    // Query para criar um novo ingrediente
    const sql = `
      INSERT INTO ingredientes (nome, unidade, alergeno)
      VALUES (?, ?, ?)
    `;

    const result = await db.query(sql, [nome, unidadeFinal, alergeno || false]);

    return {
      success: true,
      message: 'Ingrediente criado com sucesso',
      id: result.insertId
    };
  }

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Ingrediente não encontrado');
    }

    const { nome, unidade, alergeno } = data;
    
    // Validar unidade
    const unidadesValidas = ['g', 'kg', 'ml', 'l', 'unidade', 'fatia'];
    const unidadeFinal = unidade && unidadesValidas.includes(unidade) ? unidade : existing.unidade;
    
    // Query para atualizar o ingrediente
    const sql = `
      UPDATE ingredientes 
      SET nome = ?, unidade = ?, alergeno = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      nome || existing.nome,
      unidadeFinal,
      alergeno !== undefined ? alergeno : existing.alergeno,
      id
    ]);

    return {
      success: true,
      message: 'Ingrediente atualizado com sucesso'
    };
  }

  async delete(id) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Ingrediente não encontrado');
    }

    // Query para eliminar um ingrediente
    const sql = 'DELETE FROM ingredientes WHERE id = ?';
    await db.query(sql, [id]);

    return {
      success: true,
      message: 'Ingrediente removido com sucesso'
    };
  }

  // Express handlers
  async getIngredientes(req, res) {
    try {
      const { alergeno } = req.query;
      const ingredientes = await this.list({ alergeno });
      res.json(ingredientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getIngrediente(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const ingrediente = await this.getById(id);
      if (!ingrediente) {
        return res.status(404).json({ error: 'Ingrediente não encontrado' });
      }
      res.json(ingrediente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createIngrediente(req, res) {
    try {
      const result = await this.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateIngrediente(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const result = await this.update(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Ingrediente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteIngrediente(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      await this.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Ingrediente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new IngredientesService();

