#!/bin/bash
set -euo pipefail

# Aplica o schema ao banco de dados MariaDB no master
echo "==> Aplicando schema (01_schema.sql)" 

mariadb \
  -u root \
  -p"${MYSQL_ROOT_PASSWORD}" \
  < /docker-entrypoint-initdb.d/01_schema.sql 

echo "==> Schema aplicado com sucesso" 
 
 