#!/bin/bash
# Cria um utilizador para MaxScale
# Referências
# https://mariadb.com/docs/maxscale/maxscale-management
# https://mariadb.com/docs/maxscale/maxscale-quickstart-guides/mariadb-maxscale-guide
# IA usada para debugging de problemas de ligação das réplicas com o maxscale

mariadb -uroot -p${MYSQL_ROOT_PASSWORD} <<EOF
-- Criar um utilizador para MaxScale
CREATE USER IF NOT EXISTS 'maxscale_user'@'%' IDENTIFIED BY 'maxscale_password';

-- Dar permissões necessárias
GRANT REPLICATION SLAVE ON *.* TO 'maxscale_user'@'%';
GRANT REPLICATION CLIENT ON *.* TO 'maxscale_user'@'%';
GRANT SHOW DATABASES ON *.* TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.user TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.db TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.tables_priv TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.columns_priv TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.procs_priv TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.proxies_priv TO 'maxscale_user'@'%';
GRANT SELECT ON mysql.roles_mapping TO 'maxscale_user'@'%';

FLUSH PRIVILEGES;
EOF

