-- SISTEMA DE AUDIT
-- Tabela para auditar todas as alterações nas tabelas principais
-- Não tem imporância para DWeb, vai ser útil para CBD e vai sofrer alterações futuras

USE food_delivery;

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    operacao ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    registro_id INT NOT NULL,
    dados_antigos JSON,
    dados_novos JSON,
    usuario VARCHAR(100) DEFAULT USER(),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    INDEX idx_tabela (tabela),
    INDEX idx_operacao (operacao),
    INDEX idx_data (data_hora),
    INDEX idx_registro (tabela, registro_id)
) ENGINE=InnoDB;

-- Função para registrar audit
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS registrar_audit(
    IN p_tabela VARCHAR(100),
    IN p_operacao VARCHAR(10),
    IN p_registro_id INT,
    IN p_dados_antigos JSON,
    IN p_dados_novos JSON
)
BEGIN
    INSERT INTO audit_log (tabela, operacao, registro_id, dados_antigos, dados_novos)
    VALUES (p_tabela, p_operacao, p_registro_id, p_dados_antigos, p_dados_novos);
END$$

DELIMITER ;

-- Triggers para restaurantes
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS restaurantes_after_insert
AFTER INSERT ON restaurantes
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'restaurantes',
        'INSERT',
        NEW.id,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'nome', NEW.nome,
            'morada', NEW.morada,
            'telefone', NEW.telefone,
            'especialidade', NEW.especialidade,
            'tempo_medio_preparacao', NEW.tempo_medio_preparacao,
            'taxa_entrega', NEW.taxa_entrega,
            'pedido_minimo', NEW.pedido_minimo,
            'ativo', NEW.ativo
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS restaurantes_after_update
AFTER UPDATE ON restaurantes
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'restaurantes',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'id', OLD.id,
            'nome', OLD.nome,
            'morada', OLD.morada,
            'telefone', OLD.telefone,
            'especialidade', OLD.especialidade,
            'tempo_medio_preparacao', OLD.tempo_medio_preparacao,
            'taxa_entrega', OLD.taxa_entrega,
            'pedido_minimo', OLD.pedido_minimo,
            'ativo', OLD.ativo
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'nome', NEW.nome,
            'morada', NEW.morada,
            'telefone', NEW.telefone,
            'especialidade', NEW.especialidade,
            'tempo_medio_preparacao', NEW.tempo_medio_preparacao,
            'taxa_entrega', NEW.taxa_entrega,
            'pedido_minimo', NEW.pedido_minimo,
            'ativo', NEW.ativo
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS restaurantes_after_delete
AFTER DELETE ON restaurantes
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'restaurantes',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'id', OLD.id,
            'nome', OLD.nome,
            'morada', OLD.morada,
            'telefone', OLD.telefone,
            'especialidade', OLD.especialidade,
            'tempo_medio_preparacao', OLD.tempo_medio_preparacao,
            'taxa_entrega', OLD.taxa_entrega,
            'pedido_minimo', OLD.pedido_minimo,
            'ativo', OLD.ativo
        ),
        NULL
    );
END$$

DELIMITER ;

-- Triggers para pratos
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS pratos_after_insert
AFTER INSERT ON pratos
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'pratos',
        'INSERT',
        NEW.id,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'restaurante_id', NEW.restaurante_id,
            'nome', NEW.nome,
            'descricao', NEW.descricao,
            'preco', NEW.preco,
            'tempo_preparacao', NEW.tempo_preparacao,
            'disponivel', NEW.disponivel,
            'vegetariano', NEW.vegetariano,
            'vegan', NEW.vegan,
            'sem_gluten', NEW.sem_gluten
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS pratos_after_update
AFTER UPDATE ON pratos
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'pratos',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'id', OLD.id,
            'restaurante_id', OLD.restaurante_id,
            'nome', OLD.nome,
            'descricao', OLD.descricao,
            'preco', OLD.preco,
            'tempo_preparacao', OLD.tempo_preparacao,
            'disponivel', OLD.disponivel,
            'vegetariano', OLD.vegetariano,
            'vegan', OLD.vegan,
            'sem_gluten', OLD.sem_gluten
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'restaurante_id', NEW.restaurante_id,
            'nome', NEW.nome,
            'descricao', NEW.descricao,
            'preco', NEW.preco,
            'tempo_preparacao', NEW.tempo_preparacao,
            'disponivel', NEW.disponivel,
            'vegetariano', NEW.vegetariano,
            'vegan', NEW.vegan,
            'sem_gluten', NEW.sem_gluten
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS pratos_after_delete
AFTER DELETE ON pratos
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'pratos',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'id', OLD.id,
            'restaurante_id', OLD.restaurante_id,
            'nome', OLD.nome,
            'descricao', OLD.descricao,
            'preco', OLD.preco,
            'tempo_preparacao', OLD.tempo_preparacao,
            'disponivel', OLD.disponivel,
            'vegetariano', OLD.vegetariano,
            'vegan', OLD.vegan,
            'sem_gluten', OLD.sem_gluten
        ),
        NULL
    );
END$$

DELIMITER ;

-- Triggers para clientes
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS clientes_after_insert
AFTER INSERT ON clientes
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'clientes',
        'INSERT',
        NEW.id,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'nome', NEW.nome,
            'email', NEW.email,
            'telefone', NEW.telefone,
            'ativo', NEW.ativo
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS clientes_after_update
AFTER UPDATE ON clientes
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'clientes',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'id', OLD.id,
            'nome', OLD.nome,
            'email', OLD.email,
            'telefone', OLD.telefone,
            'ativo', OLD.ativo
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'nome', NEW.nome,
            'email', NEW.email,
            'telefone', NEW.telefone,
            'ativo', NEW.ativo
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS clientes_after_delete
AFTER DELETE ON clientes
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'clientes',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'id', OLD.id,
            'nome', OLD.nome,
            'email', OLD.email,
            'telefone', OLD.telefone,
            'ativo', OLD.ativo
        ),
        NULL
    );
END$$

DELIMITER ;

-- Triggers para pedidos
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS pedidos_after_insert
AFTER INSERT ON pedidos
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'pedidos',
        'INSERT',
        NEW.id,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'cliente_id', NEW.cliente_id,
            'restaurante_id', NEW.restaurante_id,
            'morada_entrega_id', NEW.morada_entrega_id,
            'codigo_pedido', NEW.codigo_pedido,
            'subtotal', NEW.subtotal,
            'taxa_entrega', NEW.taxa_entrega,
            'total', NEW.total,
            'metodo_pagamento', NEW.metodo_pagamento,
            'estado', NEW.estado,
            'observacoes', NEW.observacoes
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS pedidos_after_update
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'pedidos',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'id', OLD.id,
            'cliente_id', OLD.cliente_id,
            'restaurante_id', OLD.restaurante_id,
            'morada_entrega_id', OLD.morada_entrega_id,
            'codigo_pedido', OLD.codigo_pedido,
            'subtotal', OLD.subtotal,
            'taxa_entrega', OLD.taxa_entrega,
            'total', OLD.total,
            'metodo_pagamento', OLD.metodo_pagamento,
            'estado', OLD.estado,
            'observacoes', OLD.observacoes
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'cliente_id', NEW.cliente_id,
            'restaurante_id', NEW.restaurante_id,
            'morada_entrega_id', NEW.morada_entrega_id,
            'codigo_pedido', NEW.codigo_pedido,
            'subtotal', NEW.subtotal,
            'taxa_entrega', NEW.taxa_entrega,
            'total', NEW.total,
            'metodo_pagamento', NEW.metodo_pagamento,
            'estado', NEW.estado,
            'observacoes', NEW.observacoes
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS pedidos_after_delete
AFTER DELETE ON pedidos
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'pedidos',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'id', OLD.id,
            'cliente_id', OLD.cliente_id,
            'restaurante_id', OLD.restaurante_id,
            'morada_entrega_id', OLD.morada_entrega_id,
            'codigo_pedido', OLD.codigo_pedido,
            'subtotal', OLD.subtotal,
            'taxa_entrega', OLD.taxa_entrega,
            'total', OLD.total,
            'metodo_pagamento', OLD.metodo_pagamento,
            'estado', OLD.estado,
            'observacoes', OLD.observacoes
        ),
        NULL
    );
END$$

DELIMITER ;

-- Triggers para entregas
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS entregas_after_insert
AFTER INSERT ON entregas
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'entregas',
        'INSERT',
        NEW.id,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'cliente_id', NEW.cliente_id,
            'restaurante_id', NEW.restaurante_id,
            'morada_entrega_id', NEW.morada_entrega_id,
            'estado', NEW.estado
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS entregas_after_update
AFTER UPDATE ON entregas
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'entregas',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'id', OLD.id,
            'cliente_id', OLD.cliente_id,
            'restaurante_id', OLD.restaurante_id,
            'morada_entrega_id', OLD.morada_entrega_id,
            'estado', OLD.estado
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'cliente_id', NEW.cliente_id,
            'restaurante_id', NEW.restaurante_id,
            'morada_entrega_id', NEW.morada_entrega_id,
            'estado', NEW.estado
        )
    );
END$$

CREATE TRIGGER IF NOT EXISTS entregas_after_delete
AFTER DELETE ON entregas
FOR EACH ROW
BEGIN
    CALL registrar_audit(
        'entregas',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'id', OLD.id,
            'cliente_id', OLD.cliente_id,
            'restaurante_id', OLD.restaurante_id,
            'morada_entrega_id', OLD.morada_entrega_id,
            'estado', OLD.estado
        ),
        NULL
    );
END$$

DELIMITER ;

