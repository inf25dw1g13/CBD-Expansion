/**
 * Clientes Service
 */

const db = require('../utils/db');

class ClientesService {

  async list() {
    // Query para listar clientes com agregados
    const sql = `
      SELECT 
        c.id, 
        c.nome, 
        c.email, 
        c.telefone, 
        c.ativo,
        COUNT(p.id) as num_pedidos,
        COALESCE(SUM(p.total), 0) as total_gasto
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id
      GROUP BY c.id, c.nome, c.email, c.telefone, c.ativo
      ORDER BY c.created_at DESC, c.updated_at DESC, num_pedidos ASC
      LIMIT 50
    `;
    return await db.query(sql);
  }

  async getById(id) {
    // Query para obter um cliente por ID
    const sql = 'SELECT * FROM clientes WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data) {
    const { nome, email, telefone } = data;

    // Query para criar um novo cliente
    const sql = `
      INSERT INTO clientes (nome, email, telefone)
      VALUES (?, ?, ?)
    `;

    const result = await db.query(sql, [nome, email, telefone]);

    return {
      success: true,
      message: 'Cliente registado com sucesso',
      id: result.insertId
    };
  }

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Cliente não encontrado');
    }

    const { nome, email, telefone, ativo } = data;
    
    // Query para atualizar o cliente
    const sql = `
      UPDATE clientes 
      SET nome = ?, email = ?, telefone = ?, ativo = ?
      WHERE id = ?
    `;

    await db.query(sql, [nome, email, telefone, ativo !== undefined ? ativo : true, id]);

    return {
      success: true,
      message: 'Cliente atualizado com sucesso'
    };
  }

  async delete(id) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Cliente não encontrado');
    }

    // Query para eliminar um cliente
    const sql = 'DELETE FROM clientes WHERE id = ?';
    await db.query(sql, [id]);

    return {
      success: true,
      message: 'Cliente removido com sucesso'
    };
  }

  // Express handlers
  async getClientes(req, res) {
    try {
      const clientes = await this.list();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCliente(req, res) {
    try {
      // express-openapi-validator coloca path params em req.openapi.pathParams ou req.params
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const cliente = await this.getById(id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCliente(req, res) {
    try {
      const result = await this.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCliente(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const result = await this.update(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCliente(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      await this.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ClientesService();