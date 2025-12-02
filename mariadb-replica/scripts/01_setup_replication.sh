#!/bin/bash
# Script para configurar replicação na réplica
# Aguarda o master estar pronto e depois configura a replicação

set -e

echo "Aguardando master estar pronto..."
# Até o master estar disponível
until mariadb -h mariadb-master -uroot -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1" &> /dev/null; do
    echo "Aguardando master..."
    sleep 2
done

echo "Master está pronto. Configurando replicação..."

sleep 5

# Configura replicação usando GTID (estava a dar erro na iniciação porque a réplica tinha GTIDs antigos)
mariadb -uroot -p${MYSQL_ROOT_PASSWORD} <<EOF
-- Para replicação se estiver a rodar
STOP SLAVE;

-- Reseta replicação 
RESET SLAVE ALL;

-- Reseta binlogs da réplica para começar do zero
RESET MASTER;

-- Usa slave_pos que sincroniza automaticamente com o master
CHANGE MASTER TO
    MASTER_HOST='mariadb-master',
    MASTER_USER='repl',
    MASTER_PASSWORD='repl_password',
    MASTER_USE_GTID=slave_pos;

-- Inicia replicação
START SLAVE;

SELECT SLEEP(2);

-- Verifica status
SHOW SLAVE STATUS\G
EOF

echo "Replicação configurada!"

