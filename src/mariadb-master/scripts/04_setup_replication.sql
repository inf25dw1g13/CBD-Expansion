-- Este script configura o Master para replicação

-- Criar usuário de replicação
CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED BY 'repl_password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

-- Verificar binlog
SHOW MASTER STATUS;




