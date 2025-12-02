FROM mariadb:11.2

# Copia configuração (my.cnf)
COPY my.cnf /etc/mysql/conf.d/

# Copia os scripts SQL para um diretório initdb.d para ser executado automaticamente ao iniciar o container
COPY scripts/ /docker-entrypoint-initdb.d/