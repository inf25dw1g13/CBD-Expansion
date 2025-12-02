/**
 * PedidosService.js
 */
const db = require('../utils/db');

// Helper para arredondar valores monetários para 2 casas decimais
function roundMoney(value) {
  return Math.round((parseFloat(value) || 0) * 100) / 100;
}

class PedidosService {
  async list(filters = {}) {
    const { estado } = filters;
    
    // Query para listar pedidos com filtros
    let sql = `
      SELECT p.*, c.nome as cliente_nome, r.nome as restaurante_nome
      FROM pedidos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      INNER JOIN restaurantes r ON p.restaurante_id = r.id
    `;
    
    const params = [];
    
    if (estado) {
      sql += ' WHERE p.estado = ?';
      params.push(estado);
    }
    
    sql += ' ORDER BY p.created_at DESC, p.updated_at DESC, p.data_hora DESC LIMIT 50';
    
    return await db.query(sql, params);
  }

  async getById(id) {
    // Query para obter um pedido por ID (com cliente e restaurante)
    const sql = `
      SELECT p.*, c.nome as cliente_nome, r.nome as restaurante_nome
      FROM pedidos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      INNER JOIN restaurantes r ON p.restaurante_id = r.id
      WHERE p.id = ?
    `;
    const results = await db.query(sql, [id]);
    if (results.length === 0) return null;
    
    const pedido = results[0];
    
    // Buscar pratos do pedido
    // Query para obter os pratos de um pedido
    const pratosSql = `
      SELECT pp.*, pr.nome as prato_nome, pr.descricao as prato_descricao
      FROM pedidos_pratos pp
      INNER JOIN pratos pr ON pp.prato_id = pr.id
      WHERE pp.pedido_id = ?
      ORDER BY pp.id
    `;
    const pratos = await db.query(pratosSql, [id]);
    
    pedido.pratos = pratos;
    return pedido;
  }

  async create(data) {
    const { cliente_id, restaurante_id, morada_entrega_id, metodo_pagamento, observacoes, taxa_entrega, pratos } = data;
    
    // Validar IDs existem
    // Query para validar existência do cliente
    const cliente = await db.query('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
    if (cliente.length === 0) {
      throw new Error(`Cliente com ID ${cliente_id} não encontrado`);
    }
    
    // Query para validar existência do restaurante
    const restaurante = await db.query('SELECT id, taxa_entrega as taxa FROM restaurantes WHERE id = ?', [restaurante_id]);
    if (restaurante.length === 0) {
      throw new Error(`Restaurante com ID ${restaurante_id} não encontrado`);
    }
    
    // Query para validar existência da morada de entrega
    const morada = await db.query('SELECT id FROM moradas_entrega WHERE id = ?', [morada_entrega_id]);
    if (morada.length === 0) {
      throw new Error(`Morada de entrega com ID ${morada_entrega_id} não encontrada`);
    }
    
    // Validar que há pratos
    if (!pratos || !Array.isArray(pratos) || pratos.length === 0) {
      throw new Error('O pedido deve conter pelo menos um prato');
    }
    
    // Gerar código único do pedido
    const codigo = `FD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Calcular subtotal baseado nos pratos
    let subtotalValue = 0;
    const pratosData = [];
    
    for (const item of pratos) {
      const { prato_id, quantidade = 1, observacoes_item } = item;
      
      // Validar prato existe e obter preço atual
      // Query para obter prato e preço atual
      const prato = await db.query('SELECT id, preco, restaurante_id FROM pratos WHERE id = ? AND disponivel = TRUE', [prato_id]);
      if (prato.length === 0) {
        throw new Error(`Prato com ID ${prato_id} não encontrado ou indisponível`);
      }
      
      // Validar que o prato pertence ao restaurante do pedido
      if (prato[0].restaurante_id !== restaurante_id) {
        throw new Error(`O prato ${prato_id} não pertence ao restaurante ${restaurante_id}`);
      }
      
      const precoUnitario = roundMoney(prato[0].preco);
      const subtotalItem = roundMoney(precoUnitario * quantidade);
      subtotalValue = roundMoney(subtotalValue + subtotalItem);
      
      pratosData.push({
        prato_id,
        quantidade,
        preco_unitario: precoUnitario,
        subtotal_item: subtotalItem,
        observacoes: observacoes_item || null
      });
    }
    
    // Calcular taxa de entrega e total
    const subtotalValueRounded = roundMoney(subtotalValue);
    const taxaEntregaValue = roundMoney(taxa_entrega !== undefined ? taxa_entrega : (restaurante[0].taxa || 2.50));
    const totalValue = roundMoney(subtotalValueRounded + taxaEntregaValue);
    
    // Inserir pedido
    // Query para criar um novo pedido
    const sql = `
      INSERT INTO pedidos 
      (cliente_id, restaurante_id, morada_entrega_id, codigo_pedido, 
       subtotal, taxa_entrega, total, metodo_pagamento, estado, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)
    `;
    
    const result = await db.query(sql, [
      cliente_id, restaurante_id, morada_entrega_id, codigo,
      subtotalValueRounded, taxaEntregaValue, totalValue,
      metodo_pagamento, observacoes || null
    ]);
    
    const pedidoId = result.insertId;
    
    // Inserir pratos do pedido
    for (const item of pratosData) {
      // Query para criar os pratos de um pedido
      const pratoSql = `
        INSERT INTO pedidos_pratos 
        (pedido_id, prato_id, quantidade, preco_unitario, subtotal_item, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await db.query(pratoSql, [
        pedidoId, item.prato_id, item.quantidade, 
        item.preco_unitario, item.subtotal_item, item.observacoes
      ]);
    }
    
    return {
      success: true,
      message: 'Pedido criado com sucesso',
      id: pedidoId,
      codigo: codigo,
      pratos: pratosData.length
    };
  }

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Pedido não encontrado');
    }

    const { estado, observacoes, subtotal, taxa_entrega, metodo_pagamento, restaurante_id, pratos } = data;

    // Se restaurante_id foi fornecido, validar e preparar atualização
    let novoRestauranteId = existing.restaurante_id;
    let restauranteData = null;
    
    if (restaurante_id !== undefined && restaurante_id !== existing.restaurante_id) {
      // Validar que o novo restaurante existe
      const restaurante = await db.query('SELECT id, taxa_entrega as taxa FROM restaurantes WHERE id = ? AND ativo = TRUE', [restaurante_id]);
      if (restaurante.length === 0) {
        throw new Error(`Restaurante com ID ${restaurante_id} não encontrado ou inativo`);
      }
      
      novoRestauranteId = restaurante_id;
      restauranteData = restaurante[0];
      
      // Se o restaurante mudou, os pratos antigos não são mais válidos
      // Remover pratos antigos se não houver novos pratos sendo fornecidos
      if (pratos === undefined || !Array.isArray(pratos)) {
        await db.query('DELETE FROM pedidos_pratos WHERE pedido_id = ?', [id]);
        // Resetar subtotal e total se não houver pratos
        const subtotalRounded = roundMoney(0);
        let taxaEntregaValue;
        if (taxa_entrega !== undefined) {
          taxaEntregaValue = roundMoney(taxa_entrega);
        } else {
          taxaEntregaValue = roundMoney(restauranteData.taxa || 0);
        }
        const totalRounded = roundMoney(subtotalRounded + taxaEntregaValue);
        
        const updates = ['restaurante_id = ?', 'subtotal = ?', 'total = ?', 'taxa_entrega = ?'];
        const params = [novoRestauranteId, subtotalRounded, totalRounded, taxaEntregaValue];
        
        if (estado !== undefined) {
          updates.push('estado = ?');
          params.push(estado);
        }
        
        if (observacoes !== undefined) {
          updates.push('observacoes = ?');
          params.push(observacoes || null);
        }
        
        if (metodo_pagamento !== undefined) {
          updates.push('metodo_pagamento = ?');
          params.push(metodo_pagamento);
        }
        
        params.push(id);

        // Placeholders usados para cumprir requisitos de CBD (questões de segurança) em vez de concatenar a query diretamente
        // Não afeta a aplicação
        const sql = `UPDATE pedidos SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(sql, params);
        
        return {
          success: true,
          message: 'Pedido atualizado com sucesso. Pratos antigos foram removidos devido à mudança de restaurante.',
          restaurante_atualizado: true
        };
      }
    }

    // Se pratos foram fornecidos, atualizar a relação m:n
    if (pratos !== undefined && Array.isArray(pratos)) {
      // Validar que há pelo menos um prato
      if (pratos.length === 0) {
        throw new Error('O pedido deve conter pelo menos um prato');
      }

      // Validar restaurante do pedido (usar novo se foi fornecido, senão usar o existente)
      const restauranteIdParaValidar = novoRestauranteId;
      let restauranteInfo;
      
      if (restauranteData) {
        restauranteInfo = restauranteData;
      } else {
        const restaurante = await db.query('SELECT id, taxa_entrega as taxa FROM restaurantes WHERE id = ? AND ativo = TRUE', [restauranteIdParaValidar]);
        if (restaurante.length === 0) {
          throw new Error(`Restaurante com ID ${restauranteIdParaValidar} não encontrado ou inativo`);
        }
        restauranteInfo = restaurante[0];
      }

      // Calcular novo subtotal baseado nos pratos fornecidos
      let novoSubtotal = roundMoney(0);
      const pratosData = [];

      for (const item of pratos) {
        const { prato_id, quantidade = 1, observacoes_item } = item;

        // Validar prato existe e obter preço atual
        const prato = await db.query('SELECT id, preco, restaurante_id FROM pratos WHERE id = ? AND disponivel = TRUE', [prato_id]);
        if (prato.length === 0) {
          throw new Error(`Prato com ID ${prato_id} não encontrado ou indisponível`);
        }

        // Validar que o prato pertence ao restaurante do pedido
        if (prato[0].restaurante_id !== restauranteIdParaValidar) {
          throw new Error(`O prato ${prato_id} não pertence ao restaurante ${restauranteIdParaValidar}`);
        }

        const precoUnitario = roundMoney(prato[0].preco);
        const subtotalItem = roundMoney(precoUnitario * quantidade);
        novoSubtotal = roundMoney(novoSubtotal + subtotalItem);

        pratosData.push({
          prato_id,
          quantidade,
          preco_unitario: precoUnitario,
          subtotal_item: subtotalItem,
          observacoes: observacoes_item || null
        });
      }

      // Remover pratos antigos
      await db.query('DELETE FROM pedidos_pratos WHERE pedido_id = ?', [id]);

      // Inserir novos pratos
      for (const item of pratosData) {
        const pratoSql = `
          INSERT INTO pedidos_pratos 
          (pedido_id, prato_id, quantidade, preco_unitario, subtotal_item, observacoes)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(pratoSql, [
          id, item.prato_id, item.quantidade,
          item.preco_unitario, item.subtotal_item, item.observacoes
        ]);
      }

      // Atualizar subtotal e total no pedido
      let taxaEntregaValue;
      if (taxa_entrega !== undefined) {
        taxaEntregaValue = roundMoney(taxa_entrega);
      } else if (restaurante_id !== undefined && restaurante_id !== existing.restaurante_id) {
        // Se restaurante mudou mas taxa não foi fornecida, usar taxa do novo restaurante
        taxaEntregaValue = roundMoney(restauranteInfo.taxa || 0);
      } else {
        taxaEntregaValue = roundMoney(existing.taxa_entrega || 0);
      }
      
      const novoSubtotalRounded = roundMoney(novoSubtotal);
      const novoTotal = roundMoney(novoSubtotalRounded + taxaEntregaValue);

      // Construir query para atualizar pedido
      const updates = ['subtotal = ?', 'total = ?'];
      const params = [novoSubtotalRounded, novoTotal];

      // Atualizar restaurante_id se foi fornecido
      if (restaurante_id !== undefined && restaurante_id !== existing.restaurante_id) {
        updates.push('restaurante_id = ?');
        params.push(novoRestauranteId);
      }

      if (taxa_entrega !== undefined || (restaurante_id !== undefined && restaurante_id !== existing.restaurante_id)) {
        updates.push('taxa_entrega = ?');
        params.push(taxaEntregaValue);
      }

      if (estado !== undefined) {
        updates.push('estado = ?');
        params.push(estado);
      }

      if (observacoes !== undefined) {
        updates.push('observacoes = ?');
        params.push(observacoes || null);
      }

      if (metodo_pagamento !== undefined) {
        updates.push('metodo_pagamento = ?');
        params.push(metodo_pagamento);
      }

        params.push(id);

        // Query para atualizar o pedido (quando se muda de restaurante sem novos pratos)
        const sql = `UPDATE pedidos SET ${updates.join(', ')} WHERE id = ?`;
      await db.query(sql, params);

      return {
        success: true,
        message: 'Pedido atualizado com sucesso',
        pratos_atualizados: pratosData.length
      };
    }

    // Se pratos não foram fornecidos, atualizar apenas campos do pedido
    const updates = [];
    const params = [];

    // Atualizar restaurante_id se foi fornecido
    if (restaurante_id !== undefined && restaurante_id !== existing.restaurante_id) {
      // Validar que o novo restaurante existe
      const restaurante = await db.query('SELECT id, taxa_entrega as taxa FROM restaurantes WHERE id = ? AND ativo = TRUE', [restaurante_id]);
      if (restaurante.length === 0) {
        throw new Error(`Restaurante com ID ${restaurante_id} não encontrado ou inativo`);
      }
      
      updates.push('restaurante_id = ?');
      params.push(restaurante_id);
      
      // Se restaurante mudou, atualizar taxa de entrega para a do novo restaurante
      if (taxa_entrega === undefined) {
        updates.push('taxa_entrega = ?');
        params.push(restaurante[0].taxa || 0);
      }
    }

    if (estado !== undefined) {
      updates.push('estado = ?');
      params.push(estado);
    }

    if (observacoes !== undefined) {
      updates.push('observacoes = ?');
      params.push(observacoes || null);
    }

    if (subtotal !== undefined) {
      const subtotalRounded = roundMoney(subtotal);
      updates.push('subtotal = ?');
      params.push(subtotalRounded);
      
      // Recalcular total se subtotal mudou
      let taxaEntregaParaTotal = taxa_entrega;
      if (taxa_entrega === undefined) {
        if (restaurante_id !== undefined && restaurante_id !== existing.restaurante_id) {
          const restaurante = await db.query('SELECT taxa_entrega as taxa FROM restaurantes WHERE id = ?', [restaurante_id]);
          taxaEntregaParaTotal = restaurante[0]?.taxa || existing.taxa_entrega;
        } else {
          taxaEntregaParaTotal = existing.taxa_entrega;
        }
      }
      const taxaEntregaRounded = roundMoney(taxaEntregaParaTotal);
      const novoTotal = roundMoney(subtotalRounded + taxaEntregaRounded);
      updates.push('total = ?');
      params.push(novoTotal);
    }

    if (taxa_entrega !== undefined) {
      const taxaEntregaRounded = roundMoney(taxa_entrega);
      updates.push('taxa_entrega = ?');
      params.push(taxaEntregaRounded);
      
      // Recalcular total se taxa mudou
      const subtotalAtual = roundMoney(subtotal !== undefined ? subtotal : existing.subtotal);
      const novoTotal = roundMoney(subtotalAtual + taxaEntregaRounded);
      updates.push('total = ?');
      params.push(novoTotal);
    }

    if (metodo_pagamento !== undefined) {
      updates.push('metodo_pagamento = ?');
      params.push(metodo_pagamento);
    }

    if (updates.length === 0) {
      throw new Error('Nenhum campo fornecido para atualização');
    }

    params.push(id);

    // Query para atualizar o pedido
    const sql = `UPDATE pedidos SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.query(sql, params);

    return {
      success: true,
      message: 'Pedido atualizado com sucesso'
    };
  }

  async delete(id) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Pedido não encontrado');
    }

    // Query para eliminar o pedido (itens apagados via ON DELETE CASCADE)
    const sql = `DELETE FROM pedidos WHERE id = ?`;
    await db.query(sql, [id]);

    return {
      success: true,
      message: 'Pedido apagado com sucesso'
    };
  }

  // Express handlers
  async getPedidos(req, res) {
    try {
      const { estado } = req.query;
      const pedidos = await this.list({ estado });
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPedido(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const pedido = await this.getById(id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json(pedido);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createPedido(req, res) {
    try {
      const result = await this.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePedido(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const result = await this.update(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Pedido não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deletePedido(req, res) {
    try {
      const idParam = req.openapi?.pathParams?.id || req.params?.id;
      const id = parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      await this.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Pedido não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PedidosService();
