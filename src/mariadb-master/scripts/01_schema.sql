-- BASE DE DADOS
-- Estrutura base gerada com auxílio de IA e posteriormente adaptada.
-- Exemplo de prompt "gera um script SQL para uma base de dados de um sistema de entrega de comida, com tabelas para restaurantes, pratos, clientes, entregadores, pedidos, ingredientes, categorias de pratos, moradas de entrega, etc."

-- As tabelas tem dados que não são usados para a API, o que está a mais, faz parte de CBD e vai sofrer alterações futuras, de modo mais completo e adequado a disciplina.
-- Alguns dados/campos também podem ser vir a ser removidos para esse efeito (não vai afetar a API atual).

-- Garante que root pode conectar de qualquer IP (necessário para MaxScale)
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

DROP DATABASE IF EXISTS food_delivery;

CREATE DATABASE IF NOT EXISTS food_delivery 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE food_delivery;

-- TABELA: restaurantes
CREATE TABLE restaurantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    morada VARCHAR(300) NOT NULL,
    telefone VARCHAR(20),
    especialidade VARCHAR(100), -- Italiana, Chinesa, Hambúrgueres, etc.
    tempo_medio_preparacao INT DEFAULT 30, 
    taxa_entrega DECIMAL(6,2) DEFAULT 0.00,
    pedido_minimo DECIMAL(6,2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_especialidade (especialidade),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB;

-- TABELA: categorias_pratos
CREATE TABLE categorias_pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(300),
    icone VARCHAR(50), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: pratos
CREATE TABLE pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco DECIMAL(8,2) NOT NULL,
    tempo_preparacao INT DEFAULT 20, 
    disponivel BOOLEAN DEFAULT TRUE,
    vegetariano BOOLEAN DEFAULT FALSE,
    vegan BOOLEAN DEFAULT FALSE,
    sem_gluten BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE,
    INDEX idx_restaurante (restaurante_id),
    INDEX idx_disponivel (disponivel),
    INDEX idx_preco (preco)
) ENGINE=InnoDB;

-- TABELA: ingredientes
CREATE TABLE ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    unidade ENUM('g', 'kg', 'ml', 'l', 'unidade', 'fatia') DEFAULT 'g',
    alergeno BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: pratos_ingredientes
CREATE TABLE pratos_ingredientes (
    prato_id INT NOT NULL,
    ingrediente_id INT NOT NULL,
    quantidade DECIMAL(8,2) NOT NULL,
    obrigatorio BOOLEAN DEFAULT TRUE, 
    PRIMARY KEY (prato_id, ingrediente_id),
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- TABELA: clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_telefone (telefone)
) ENGINE=InnoDB;

-- TABELA: moradas_entrega
CREATE TABLE moradas_entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'Casa', 
    morada VARCHAR(300) NOT NULL,
    codigo_postal VARCHAR(10),
    cidade VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    instrucoes_entrega TEXT, 
    favorita BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id),
    INDEX idx_localizacao (latitude, longitude)
) ENGINE=InnoDB;

-- TABELA: entregadores
CREATE TABLE entregadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    veiculo ENUM('bicicleta', 'mota', 'carro') NOT NULL,
    matricula VARCHAR(20),
    disponivel BOOLEAN DEFAULT FALSE, 
    em_entrega BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ultima_atualizacao_gps TIMESTAMP NULL,
    rating DECIMAL(3,2) DEFAULT 5.00,
    num_avaliacoes INT DEFAULT 0,
    num_entregas INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_disponivel (disponivel),
    INDEX idx_localizacao (latitude, longitude),
    INDEX idx_rating (rating)
) ENGINE=InnoDB;

-- TABELA: pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    restaurante_id INT NOT NULL,
    morada_entrega_id INT NOT NULL,
    codigo_pedido VARCHAR(20) UNIQUE NOT NULL, 
    subtotal DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(6,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    metodo_pagamento ENUM('cartao', 'mbway', 'dinheiro', 'carteira') NOT NULL,
    estado ENUM(
        'pendente',
        'confirmado',
        'a_preparar',
        'pronto',
        'a_caminho',
        'entregue',
        'cancelado'
    ) DEFAULT 'pendente',
    observacoes TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (morada_entrega_id) REFERENCES moradas_entrega(id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_restaurante (restaurante_id),
    INDEX idx_estado (estado),
    INDEX idx_data (data_hora),
    INDEX idx_codigo (codigo_pedido)
) ENGINE=InnoDB;

-- TABELA: pedidos_pratos 
CREATE TABLE pedidos_pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    prato_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(8,2) NOT NULL, 
    subtotal_item DECIMAL(10,2) NOT NULL, 
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE RESTRICT,
    INDEX idx_pedido (pedido_id),
    INDEX idx_prato (prato_id)
) ENGINE=InnoDB;

-- TABELA: entregas
CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    restaurante_id INT NOT NULL,
    morada_entrega_id INT NOT NULL,
    estado ENUM(
        'pendente',
        'a_caminho',
        'entregue',
        'cancelada'
    ) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (morada_entrega_id) REFERENCES moradas_entrega(id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_restaurante (restaurante_id),
    INDEX idx_estado (estado),
    INDEX idx_data (created_at)
) ENGINE=InnoDB;

-- Criar usuário para a API (usado pelo MaxScale)
CREATE USER IF NOT EXISTS 'api_user'@'%' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON food_delivery.* TO 'api_user'@'%';
FLUSH PRIVILEGES;