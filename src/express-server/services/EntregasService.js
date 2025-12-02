/**
 * Entregas Service
 */

const db = require('../utils/db');

const ESTADOS_VALIDOS = ['pendente', 'a_caminho', 'entregue', 'cancelada'];

class EntregasService {

  normalizeEstado(estado) {
    if (!estado) {
      return undefined;
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    return estado;
  }

  parseId(value, fieldName) {
    if (value === undefined || value === null) {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new Error(`${fieldName} inválido`);
    }
    return parsed;
  }

  async list(filters = {}) {
    const {
      estado,
      cliente_id: clienteId,
      restaurante_id: restauranteId,
      morada_entrega_id: moradaEntregaId
    } = filters;

    // Query para listar entregas com filtros
    let sql = `
      SELECT id, cliente_id, restaurante_id, morada_entrega_id, estado, created_at, updated_at
      FROM entregas
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      sql += ' AND estado = ?';
      params.push(this.normalizeEstado(estado));
    }

    const numericFilters = [
      { key: 'cliente_id', value: clienteId },
      { key: 'restaurante_id', value: restauranteId },
      { key: 'morada_entrega_id', value: moradaEntregaId }
    ];

    numericFilters.forEach(({ key, value }) => {
      if (value !== undefined) {
        const parsed = this.parseId(value, key);
        sql += ` AND ${key} = ?`;
        params.push(parsed);
      }
    });

    sql += ' ORDER BY created_at DESC, updated_at DESC';

    return db.query(sql, params);
  }

  async getById(id) {
    const entregaId = this.parseId(id, 'id');
    // Query para obter uma entrega por ID
    const sql = `
      SELECT id, cliente_id, restaurante_id, morada_entrega_id, estado, created_at, updated_at
      FROM entregas
      WHERE id = ?
    `;
    const results = await db.query(sql, [entregaId]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data) {
    const clienteId = this.parseId(data.cliente_id, 'cliente_id');
    const restauranteId = this.parseId(data.restaurante_id, 'restaurante_id');
    const moradaEntregaId = this.parseId(data.morada_entrega_id, 'morada_entrega_id');

    if (!clienteId || !restauranteId || !moradaEntregaId) {
      throw new Error('cliente_id, restaurante_id e morada_entrega_id são obrigatórios');
    }

    const estado = this.normalizeEstado(data.estado) || 'pendente';

    // Query para criar uma nova entrega
    const sql = `
      INSERT INTO entregas (cliente_id, restaurante_id, morada_entrega_id, estado)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.query(sql, [clienteId, restauranteId, moradaEntregaId, estado]);

    return {
      success: true,
      message: 'Entrega criada com sucesso',
      id: result.insertId
    };
  }

  async update(id, data) {
    const entregaId = this.parseId(id, 'id');
    const existing = await this.getById(entregaId);

    if (!existing) {
      throw new Error('Entrega não encontrada');
    }

    const campos = [];
    const params = [];

    ['cliente_id', 'restaurante_id', 'morada_entrega_id'].forEach((campo) => {
      if (data[campo] !== undefined) {
        const parsed = this.parseId(data[campo], campo);
        campos.push(`${campo} = ?`);
        params.push(parsed);
      }
    });

    if (data.estado !== undefined) {
      campos.push('estado = ?');
      params.push(this.normalizeEstado(data.estado));
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    // Query para atualizar a entrega
    const sql = `
      UPDATE entregas
      SET ${campos.join(', ')}
      WHERE id = ?
    `;

    params.push(entregaId);

    await db.query(sql, params);

    return {
      success: true,
      message: 'Entrega atualizada com sucesso'
    };
  }

  async delete(id) {
    const entregaId = this.parseId(id, 'id');
    const existing = await this.getById(entregaId);

    if (!existing) {
      throw new Error('Entrega não encontrada');
    }

    // Query para eliminar a entrega
    await db.query('DELETE FROM entregas WHERE id = ?', [entregaId]);

    return {
      success: true,
      message: 'Entrega removida com sucesso'
    };
  }

  // Express handlers
  async getEntregas(req, res) {
    try {
      const entregas = await this.list(req.query);
      res.json(entregas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEntrega(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const entrega = await this.getById(idParam);
      if (!entrega) {
        return res.status(404).json({ error: 'Entrega não encontrada' });
      }
      res.json(entrega);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createEntrega(req, res) {
    try {
      const result = await this.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEntrega(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const result = await this.update(idParam, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Entrega não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEntrega(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      await this.delete(idParam);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Entrega não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new EntregasService();


