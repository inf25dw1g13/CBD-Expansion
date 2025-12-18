-- BASE DE DADOS

-- Garante que root pode conectar de qualquer IP (necessário para MaxScale)
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

DROP DATABASE IF EXISTS food_delivery;
CREATE DATABASE IF NOT EXISTS food_delivery;

USE food_delivery;

-- ======================================
-- TABELA: codpostal 
-- ======================================
CREATE TABLE codpostal (
    codpostal CHAR(8) PRIMARY KEY,        
    localidade VARCHAR(50) NOT NULL,
    cidade VARCHAR(30) NOT NULL             
);

-- ======================================
-- TABELA: categorias_pratos
-- ======================================
CREATE TABLE categorias_pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- TABELA: restaurantes 
-- ======================================
CREATE TABLE restaurantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    morada VARCHAR(100) NOT NULL,
    codpostal CHAR(8) NOT NULL,
    email VARCHAR(50) UNIQUE,
    telefone CHAR(9) UNIQUE,
    especialidade_id INT,
    hora_abertura TIME,
    hora_fecho TIME,
    estado ENUM('aberto', 'fechado', 'indisponivel') DEFAULT 'aberto',
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (especialidade_id) REFERENCES categorias_pratos(id),
    FOREIGN KEY (codpostal) REFERENCES codpostal(codpostal)
);

-- ======================================
-- TABELA: ingredientes
-- ======================================
CREATE TABLE ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    tipo ENUM('fruta', 'vegetal', 'carne', 'peixe', 'lacticinio', 'cereal', 'leguminosa', 'condimento', 'outro') DEFAULT 'outro',
    alergeno BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- TABELA: pratos
-- ======================================
CREATE TABLE pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    categoria_id INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    disponivel BOOLEAN DEFAULT TRUE,
    vegetariano BOOLEAN DEFAULT FALSE,
    vegan BOOLEAN DEFAULT FALSE,
    sem_gluten BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias_pratos(id)
);

-- ======================================
-- TABELA: pratos_ingredientes
-- ======================================
CREATE TABLE pratos_ingredientes (
    prato_id INT NOT NULL,
    ingrediente_id INT NOT NULL,
    quantidade VARCHAR(20) NOT NULL,
    obrigatorio BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (prato_id, ingrediente_id),
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
);

-- ======================================
-- TABELA: clientes
-- ======================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    telefone CHAR(9) NOT NULL UNIQUE,
    morada VARCHAR(100) NOT NULL,
    codpostal CHAR(8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (codpostal) REFERENCES codpostal(codpostal)
);

-- ======================================
-- TABELA: entregadores
-- ======================================
CREATE TABLE entregadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE,
    telefone CHAR(9) UNIQUE,
    codpostal CHAR(8),
    estado ENUM('disponivel', 'ocupado', 'indisponivel') DEFAULT 'disponivel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (codpostal) REFERENCES codpostal(codpostal)
);

-- ======================================
-- TABELA: pedidos 
-- ======================================
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    restaurante_id INT NOT NULL,
    entregador_id INT,
    metodo_pagamento ENUM('cartao', 'mbway', 'dinheiro', 'paypal') NOT NULL,
    estado ENUM('pendente', 'confirmado', 'em_preparacao', 'pronto', 'a_caminho', 'entregue', 'cancelado') DEFAULT 'pendente',
    hora_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-- ======================================
-- TABELA: pedidos_pratos
-- ======================================
CREATE TABLE pedidos_pratos (
    pedido_id INT NOT NULL,
    prato_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pedido_id, prato_id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (prato_id) REFERENCES pratos(id)
);

-- ======================================
-- TABELA: entregas
-- ======================================
CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL UNIQUE,  
    entregador_id INT NOT NULL,
    tempo_estimado_min INT,
    tempo_real_min INT,
    estado ENUM('pendente', 'a_caminho', 'entregue', 'cancelada', 'problema') DEFAULT 'pendente',
    hora_entrega TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-----------------------------

-- ======================================
-- TRIGGERS (importante para as tabelas) (maybe eu faço outro ficheiro para isto)
-- ======================================

DELIMITER //

-- Atualiza total do pedido após insert/update/delete em pedidos_pratos
CREATE TRIGGER calcular_total_pedido
AFTER INSERT ON pedidos_pratos
FOR EACH ROW
BEGIN
    UPDATE pedidos p
    SET total = (
        SELECT COALESCE(SUM(pp.quantidade * pr.preco), 0)
        FROM pedidos_pratos pp
        JOIN pratos pr ON pp.prato_id = pr.id
        WHERE pp.pedido_id = NEW.pedido_id
    )
    WHERE p.id = NEW.pedido_id;
END//

CREATE TRIGGER calcular_total_pedido_delete
AFTER DELETE ON pedidos_pratos
FOR EACH ROW
BEGIN
    UPDATE pedidos p
    SET total = (
        SELECT COALESCE(SUM(pp.quantidade * pr.preco), 0)
        FROM pedidos_pratos pp
        JOIN pratos pr ON pp.prato_id = pr.id
        WHERE pp.pedido_id = OLD.pedido_id
    )
    WHERE p.id = OLD.pedido_id;
END//

CREATE TRIGGER calcular_total_pedido_update
AFTER UPDATE ON pedidos_pratos
FOR EACH ROW
BEGIN
    UPDATE pedidos p
    SET total = (
        SELECT COALESCE(SUM(pp.quantidade * pr.preco), 0)
        FROM pedidos_pratos pp
        JOIN pratos pr ON pp.prato_id = pr.id
        WHERE pp.pedido_id = NEW.pedido_id
    )
    WHERE p.id = NEW.pedido_id;
END//

-- Atualiza hora_entrega automaticamente
CREATE TRIGGER atualizar_hora_entrega
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF NEW.estado = 'entregue' AND OLD.estado != 'entregue' THEN
        SET NEW.hora_entrega = NOW();
    END IF;
END//

-- Atualiza estado do entregador
CREATE TRIGGER atualizar_entregador_pedido
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF NEW.entregador_id IS NOT NULL AND OLD.entregador_id IS NULL THEN
        UPDATE entregadores SET estado = 'ocupado' WHERE id = NEW.entregador_id;
    END IF;

    IF (NEW.estado = 'entregue' OR NEW.estado = 'cancelado') AND OLD.estado != NEW.estado AND NEW.entregador_id IS NOT NULL THEN
        UPDATE entregadores SET estado = 'disponivel' WHERE id = NEW.entregador_id;
    END IF;
END//

DELIMITER ;

-- ======================================
-- VIEWS - vista com informações completas dos pedidos [nao sei se vai ficar no trabalho ja que nao demos mas  é interessante]
-- ======================================
CREATE VIEW view_pedidos_completos AS
SELECT 
    p.id,
    p.estado,
    p.hora_pedido,
    p.hora_entrega,
    p.total,
    p.metodo_pagamento,
    
    c.nome AS cliente_nome,
    c.telefone AS cliente_telefone,
    c.morada AS morada_entrega,
    CONCAT(cp_c.codpostal, ' ', cp_c.localidade, ', ', cp_c.cidade) AS localidade_entrega,
    
    r.nome AS restaurante_nome,
    r.telefone AS restaurante_telefone,
    r.morada AS morada_restaurante,
    CONCAT(cp_r.codpostal, ' ', cp_r.localidade, ', ', cp_r.cidade) AS localidade_restaurante,
    
    e.nome AS entregador_nome,
    e.telefone AS entregador_telefone
    
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
JOIN codpostal cp_c ON c.codpostal = cp_c.codpostal
JOIN restaurantes r ON p.restaurante_id = r.id
JOIN codpostal cp_r ON r.codpostal = cp_r.codpostal
LEFT JOIN entregadores e ON p.entregador_id = e.id;


------------------------
-- Criar usuário para a API (usado pelo MaxScale)
CREATE USER IF NOT EXISTS 'api_user'@'%' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON food_delivery.* TO 'api_user'@'%';
FLUSH PRIVILEGES;


