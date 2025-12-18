-- SISTEMA DE AUDIT
USE food_delivery;

-- ======================================
-- TABELA: audit
-- ======================================
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabela_nome VARCHAR(50) NOT NULL,
    operacao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    registro_id INT NOT NULL,
    dados_anteriores JSON,
    dados_novos JSON,
    utilizador VARCHAR(50),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Funções para registrar audit
DELIMITER //

-- ======================================
-- TABELA: codpostal
-- ======================================
CREATE TRIGGER audit_codpostal_insert
AFTER INSERT ON codpostal
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('codpostal','INSERT',NULL, JSON_OBJECT('codpostal', NEW.codpostal, 'localidade', NEW.localidade, 'cidade', NEW.cidade));
END//

CREATE TRIGGER audit_codpostal_update
AFTER UPDATE ON codpostal
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('codpostal','UPDATE',NULL,
        JSON_OBJECT('codpostal', OLD.codpostal, 'localidade', OLD.localidade, 'cidade', OLD.cidade),
        JSON_OBJECT('codpostal', NEW.codpostal, 'localidade', NEW.localidade, 'cidade', NEW.cidade)
    );
END//

CREATE TRIGGER audit_codpostal_delete
AFTER DELETE ON codpostal
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('codpostal','DELETE',NULL,
        JSON_OBJECT('codpostal', OLD.codpostal, 'localidade', OLD.localidade, 'cidade', OLD.cidade)
    );
END//

-- ======================================
-- TABELA: categorias_pratos
-- ======================================
CREATE TRIGGER audit_categorias_insert
AFTER INSERT ON categorias_pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('categorias_pratos','INSERT', NEW.id,
        JSON_OBJECT('nome', NEW.nome, 'created_at', NEW.created_at)
    );
END//

CREATE TRIGGER audit_categorias_update
AFTER UPDATE ON categorias_pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('categorias_pratos','UPDATE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'created_at', OLD.created_at),
        JSON_OBJECT('nome', NEW.nome, 'created_at', NEW.created_at)
    );
END//

CREATE TRIGGER audit_categorias_delete
AFTER DELETE ON categorias_pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('categorias_pratos','DELETE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'created_at', OLD.created_at)
    );
END//

-- ======================================
-- TABELA: restaurantes
-- ======================================
CREATE TRIGGER audit_restaurantes_insert
AFTER INSERT ON restaurantes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('restaurantes','INSERT', NEW.id,
        JSON_OBJECT('nome', NEW.nome, 'morada', NEW.morada, 'codpostal', NEW.codpostal, 'email', NEW.email, 'telefone', NEW.telefone, 'especialidade_id', NEW.especialidade_id, 'hora_abertura', NEW.hora_abertura, 'hora_fecho', NEW.hora_fecho, 'estado', NEW.estado, 'descricao', NEW.descricao)
    );
END//

CREATE TRIGGER audit_restaurantes_update
AFTER UPDATE ON restaurantes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('restaurantes','UPDATE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'morada', OLD.morada, 'codpostal', OLD.codpostal, 'email', OLD.email, 'telefone', OLD.telefone, 'especialidade_id', OLD.especialidade_id, 'hora_abertura', OLD.hora_abertura, 'hora_fecho', OLD.hora_fecho, 'estado', OLD.estado, 'descricao', OLD.descricao),
        JSON_OBJECT('nome', NEW.nome, 'morada', NEW.morada, 'codpostal', NEW.codpostal, 'email', NEW.email, 'telefone', NEW.telefone, 'especialidade_id', NEW.especialidade_id, 'hora_abertura', NEW.hora_abertura, 'hora_fecho', NEW.hora_fecho, 'estado', NEW.estado, 'descricao', NEW.descricao)
    );
END//

CREATE TRIGGER audit_restaurantes_delete
AFTER DELETE ON restaurantes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('restaurantes','DELETE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'morada', OLD.morada, 'codpostal', OLD.codpostal, 'email', OLD.email, 'telefone', OLD.telefone, 'especialidade_id', OLD.especialidade_id, 'hora_abertura', OLD.hora_abertura, 'hora_fecho', OLD.hora_fecho, 'estado', OLD.estado, 'descricao', OLD.descricao)
    );
END//

-- ======================================
-- TABELA: ingredientes
-- ======================================
CREATE TRIGGER audit_ingredientes_insert
AFTER INSERT ON ingredientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('ingredientes','INSERT', NEW.id,
        JSON_OBJECT('nome', NEW.nome, 'tipo', NEW.tipo, 'alergeno', NEW.alergeno)
    );
END//

CREATE TRIGGER audit_ingredientes_update
AFTER UPDATE ON ingredientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('ingredientes','UPDATE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'tipo', OLD.tipo, 'alergeno', OLD.alergeno),
        JSON_OBJECT('nome', NEW.nome, 'tipo', NEW.tipo, 'alergeno', NEW.alergeno)
    );
END//

CREATE TRIGGER audit_ingredientes_delete
AFTER DELETE ON ingredientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('ingredientes','DELETE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'tipo', OLD.tipo, 'alergeno', OLD.alergeno)
    );
END//

-- ======================================
-- TABELA: pratos
-- ======================================
CREATE TRIGGER audit_pratos_insert
AFTER INSERT ON pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('pratos','INSERT', NEW.id,
        JSON_OBJECT('restaurante_id', NEW.restaurante_id, 'categoria_id', NEW.categoria_id, 'nome', NEW.nome, 'preco', NEW.preco, 'descricao', NEW.descricao, 'disponivel', NEW.disponivel, 'vegetariano', NEW.vegetariano, 'vegan', NEW.vegan, 'sem_gluten', NEW.sem_gluten)
    );
END//

CREATE TRIGGER audit_pratos_update
AFTER UPDATE ON pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('pratos','UPDATE', OLD.id,
        JSON_OBJECT('restaurante_id', OLD.restaurante_id, 'categoria_id', OLD.categoria_id, 'nome', OLD.nome, 'preco', OLD.preco, 'descricao', OLD.descricao, 'disponivel', OLD.disponivel, 'vegetariano', OLD.vegetariano, 'vegan', OLD.vegan, 'sem_gluten', OLD.sem_gluten),
        JSON_OBJECT('restaurante_id', NEW.restaurante_id, 'categoria_id', NEW.categoria_id, 'nome', NEW.nome, 'preco', NEW.preco, 'descricao', NEW.descricao, 'disponivel', NEW.disponivel, 'vegetariano', NEW.vegetariano, 'vegan', NEW.vegan, 'sem_gluten', NEW.sem_gluten)
    );
END//

CREATE TRIGGER audit_pratos_delete
AFTER DELETE ON pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('pratos','DELETE', OLD.id,
        JSON_OBJECT('restaurante_id', OLD.restaurante_id, 'categoria_id', OLD.categoria_id, 'nome', OLD.nome, 'preco', OLD.preco, 'descricao', OLD.descricao, 'disponivel', OLD.disponivel, 'vegetariano', OLD.vegetariano, 'vegan', OLD.vegan, 'sem_gluten', OLD.sem_gluten)
    );
END//

-- ======================================
-- TABELA: pratos_ingredientes
-- ======================================
CREATE TRIGGER audit_pratos_ingredientes_insert
AFTER INSERT ON pratos_ingredientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('pratos_ingredientes','INSERT', NULL,
        JSON_OBJECT('prato_id', NEW.prato_id, 'ingrediente_id', NEW.ingrediente_id, 'quantidade', NEW.quantidade, 'obrigatorio', NEW.obrigatorio)
    );
END//

CREATE TRIGGER audit_pratos_ingredientes_update
AFTER UPDATE ON pratos_ingredientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('pratos_ingredientes','UPDATE', NULL,
        JSON_OBJECT('prato_id', OLD.prato_id, 'ingrediente_id', OLD.ingrediente_id, 'quantidade', OLD.quantidade, 'obrigatorio', OLD.obrigatorio),
        JSON_OBJECT('prato_id', NEW.prato_id, 'ingrediente_id', NEW.ingrediente_id, 'quantidade', NEW.quantidade, 'obrigatorio', NEW.obrigatorio)
    );
END//

CREATE TRIGGER audit_pratos_ingredientes_delete
AFTER DELETE ON pratos_ingredientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('pratos_ingredientes','DELETE', NULL,
        JSON_OBJECT('prato_id', OLD.prato_id, 'ingrediente_id', OLD.ingrediente_id, 'quantidade', OLD.quantidade, 'obrigatorio', OLD.obrigatorio)
    );
END//

-- ======================================
-- TABELA: clientes
-- ======================================
CREATE TRIGGER audit_clientes_insert
AFTER INSERT ON clientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('clientes','INSERT', NEW.id,
        JSON_OBJECT('nome', NEW.nome, 'email', NEW.email, 'telefone', NEW.telefone, 'morada', NEW.morada, 'codpostal', NEW.codpostal)
    );
END//

CREATE TRIGGER audit_clientes_update
AFTER UPDATE ON clientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('clientes','UPDATE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'email', OLD.email, 'telefone', OLD.telefone, 'morada', OLD.morada, 'codpostal', OLD.codpostal),
        JSON_OBJECT('nome', NEW.nome, 'email', NEW.email, 'telefone', NEW.telefone, 'morada', NEW.morada, 'codpostal', NEW.codpostal)
    );
END//

CREATE TRIGGER audit_clientes_delete
AFTER DELETE ON clientes
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('clientes','DELETE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'email', OLD.email, 'telefone', OLD.telefone, 'morada', OLD.morada, 'codpostal', OLD.codpostal)
    );
END//

-- ======================================
-- TABELA: entregadores
-- ======================================
CREATE TRIGGER audit_entregadores_insert
AFTER INSERT ON entregadores
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('entregadores','INSERT', NEW.id,
        JSON_OBJECT('nome', NEW.nome, 'email', NEW.email, 'telefone', NEW.telefone, 'codpostal', NEW.codpostal, 'estado', NEW.estado)
    );
END//

CREATE TRIGGER audit_entregadores_update
AFTER UPDATE ON entregadores
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('entregadores','UPDATE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'email', OLD.email, 'telefone', OLD.telefone, 'codpostal', OLD.codpostal, 'estado', OLD.estado),
        JSON_OBJECT('nome', NEW.nome, 'email', NEW.email, 'telefone', NEW.telefone, 'codpostal', NEW.codpostal, 'estado', NEW.estado)
    );
END//

CREATE TRIGGER audit_entregadores_delete
AFTER DELETE ON entregadores
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('entregadores','DELETE', OLD.id,
        JSON_OBJECT('nome', OLD.nome, 'email', OLD.email, 'telefone', OLD.telefone, 'codpostal', OLD.codpostal, 'estado', OLD.estado)
    );
END//

-- ======================================
-- TABELA: pedidos
-- ======================================
CREATE TRIGGER audit_pedidos_insert
AFTER INSERT ON pedidos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('pedidos','INSERT', NEW.id,
        JSON_OBJECT('cliente_id', NEW.cliente_id, 'restaurante_id', NEW.restaurante_id, 'entregador_id', NEW.entregador_id, 'metodo_pagamento', NEW.metodo_pagamento, 'estado', NEW.estado, 'hora_pedido', NEW.hora_pedido, 'total', NEW.total)
    );
END//

CREATE TRIGGER audit_pedidos_update
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('pedidos','UPDATE', OLD.id,
        JSON_OBJECT('cliente_id', OLD.cliente_id, 'restaurante_id', OLD.restaurante_id, 'entregador_id', OLD.entregador_id, 'metodo_pagamento', OLD.metodo_pagamento, 'estado', OLD.estado, 'hora_pedido', OLD.hora_pedido, 'total', OLD.total),
        JSON_OBJECT('cliente_id', NEW.cliente_id, 'restaurante_id', NEW.restaurante_id, 'entregador_id', NEW.entregador_id, 'metodo_pagamento', NEW.metodo_pagamento, 'estado', NEW.estado, 'hora_pedido', NEW.hora_pedido, 'total', NEW.total)
    );
END//

CREATE TRIGGER audit_pedidos_delete
AFTER DELETE ON pedidos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('pedidos','DELETE', OLD.id,
        JSON_OBJECT('cliente_id', OLD.cliente_id, 'restaurante_id', OLD.restaurante_id, 'entregador_id', OLD.entregador_id, 'metodo_pagamento', OLD.metodo_pagamento, 'estado', OLD.estado, 'hora_pedido', OLD.hora_pedido, 'total', OLD.total)
    );
END//

-- ======================================
-- TABELA: pedidos_pratos
-- ======================================
CREATE TRIGGER audit_pedidos_pratos_insert
AFTER INSERT ON pedidos_pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('pedidos_pratos','INSERT', NULL,
        JSON_OBJECT('pedido_id', NEW.pedido_id, 'prato_id', NEW.prato_id, 'quantidade', NEW.quantidade)
    );
END//

CREATE TRIGGER audit_pedidos_pratos_update
AFTER UPDATE ON pedidos_pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('pedidos_pratos','UPDATE', NULL,
        JSON_OBJECT('pedido_id', OLD.pedido_id, 'prato_id', OLD.prato_id, 'quantidade', OLD.quantidade),
        JSON_OBJECT('pedido_id', NEW.pedido_id, 'prato_id', NEW.prato_id, 'quantidade', NEW.quantidade)
    );
END//

CREATE TRIGGER audit_pedidos_pratos_delete
AFTER DELETE ON pedidos_pratos
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores)
    VALUES ('pedidos_pratos','DELETE', NULL,
        JSON_OBJECT('pedido_id', OLD.pedido_id, 'prato_id', OLD.prato_id, 'quantidade', OLD.quantidade)
    );
END//

-- ======================================
-- TABELA: entregas
-- ======================================
CREATE TRIGGER audit_entregas_insert
AFTER INSERT ON entregas
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_novos)
    VALUES ('entregas','INSERT', NEW.id,
        JSON_OBJECT('pedido_id', NEW.pedido_id, 'entregador_id', NEW.entregador_id, 'tempo_estimado_min', NEW.tempo_estimado_min, 'tempo_real_min', NEW.tempo_real_min, 'estado', NEW.estado, 'hora_entrega', NEW.hora_entrega)
    );
END//

CREATE TRIGGER audit_entregas_update
AFTER UPDATE ON entregas
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(tabela_nome, operacao, registro_id, dados_anteriores, dados_novos)
    VALUES ('entregas','UPDATE', OLD.id,
        JSON_OBJECT('pedido_id', OLD.pedido_id, 'entregador_id', OLD.entregador_id, 'tempo_estimado_min', OLD.tempo_estimado_min, 'tempo_real_min', OLD.tempo_real_min, 'estado', OLD.estado, 'hora_entrega', OLD.hora_entrega),
        JSON_OBJECT('pedido_id', NEW.pedido_id, 'entregador_id', NEW.entregador_id, 'tempo_estimado_min', NEW.tempo_estimado_min, 'tempo_real_min', NEW.tempo_real_min, 'estado', NEW.estado, 'hora_entrega', NEW.hora_entrega)
    );
END//
