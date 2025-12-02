//Database Connection

const mysql = require('mysql2/promise');

// Configuração da BD
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',   // 'localhost' para standalone, 'mariadb' para docker-compose, 'maxscale' para replicação
  port: process.env.DB_PORT || 3306,          // 3306 para uma ligação direta, 4006 para MaxScale
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_password',
  database: process.env.DB_NAME || 'food_delivery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const isMaxScale = process.env.DB_PORT == '4006' || process.env.DB_HOST === 'maxscale' || process.env.DB_PORT == 4006;
    
    if (isMaxScale) {
      console.log('Conectado ao MariaDB via MaxScale (Replicacao)');
      console.log('   Leituras -> Replicas');
      console.log('   Escritas -> Master');
    } else {
      console.log('Conectado ao MariaDB (Sem replicacao)');
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar a BD:', error.message);
    return false;
  }
}

// Executar query
async function query(sql, params = []) {
  const [results, fields] = await pool.execute(sql, params);
  // Para INSERT/UPDATE/DELETE, results contém insertId/affectedRows
  // Para SELECT, results é um array
  return results;
}

module.exports = {
  pool,
  query,
  testConnection
};