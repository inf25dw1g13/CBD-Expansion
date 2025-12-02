FROM mariadb:11.2

# Copia configuração (my.cnf)
COPY my.cnf /etc/mysql/conf.d/

# Copia os scripts da replicação 
COPY scripts/ /docker-entrypoint-initdb.d/

# Torna o script executável
RUN chmod +x /docker-entrypoint-initdb.d/*.sh 2>/dev/null || true