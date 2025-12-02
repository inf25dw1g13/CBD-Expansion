const express = require('express');
const cors = require('cors');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const openApiRouter = require('./utils/openapiRouter');
const db = require('./utils/db');

class ExpressServer {
  constructor(port, openApiYaml) {
    this.port = port;
    this.app = express();
    this.openApiPath = openApiYaml;

    // Carregar o schema OpenAPI para o Swagger 
    try {
      this.schema = YAML.load(openApiYaml);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Falha ao carregar o ficheiro OpenAPI:', e.message);
      this.schema = null;
    }

    this.setupMiddleware();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rota Swagger UI
    this.app.get('/', (req, res) => {
      res.redirect('/api-docs');
    });

    this.app.get('/favicon.ico', (req, res) => {
      res.status(204).end();
    });

    // Preparar documento OpenAPI 
    let swaggerDocument = this.schema;
    if (!swaggerDocument) {
      swaggerDocument = YAML.load(this.openApiPath);
    }

    // Ordenar paths 
    const sortedSwaggerDoc = JSON.parse(JSON.stringify(swaggerDocument));
    if (sortedSwaggerDoc.paths) {
      const { paths } = sortedSwaggerDoc;
      const pathKeys = Object.keys(paths);
      const pathsWithParams = [];
      const pathsWithoutParams = [];

      pathKeys.forEach((key) => {
        if (key.includes('{id}') || key.includes('{')) {
          pathsWithParams.push(key);
        } else {
          pathsWithoutParams.push(key);
        }
      });

      pathsWithParams.sort();
      pathsWithoutParams.sort();

      const sortedPaths = {};
      [...pathsWithParams, ...pathsWithoutParams].forEach((key) => {
        sortedPaths[key] = paths[key];
      });

      sortedSwaggerDoc.paths = sortedPaths;
    }

    // Swagger UI
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(sortedSwaggerDoc, {
        customCss:
          '.swagger-ui .topbar { display: none } .swagger-ui .filter-container { display: none !important; }',
        customSiteTitle: 'Food Delivery API',
        swaggerOptions: {
          operationsSorter: 'alpha',
          tagsSorter: 'alpha',
          displayRequestDuration: true,
          filter: false,
          showExtensions: true,
          showCommonExtensions: true,
        },
      }),
    );

    // Health check (rota fora do OpenAPI, por isso vem ANTES do validator)
    this.app.get('/health', async (req, res) => {
      try {
        await db.query('SELECT 1');
        res.json({ status: 'OK', database: 'Connected' });
      } catch (error) {
        res.status(500).json({ status: 'ERROR', database: error.message });
      }
    });

    // Middleware OpenAPI validator + router (só para rotas definidas no openapi.yaml)
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: this.openApiPath,
      }),
    );
    this.app.use(openApiRouter());

    // Error handler
    // eslint-disable-next-line no-unused-vars
    this.app.use((err, req, res, next) => {
      // eslint-disable-next-line no-console
      console.error('Erro:', err);
      res.status(500).json({ error: 'Erro interno', message: err.message });
    });
  }

  async launch() {
    try {
      // Testar conexão BD com retry
      const connected = await db.testConnection();

      if (!connected) {
        // eslint-disable-next-line no-console
        console.error('Nao foi possivel conectar a BD');
        // eslint-disable-next-line no-console
        console.log('A aguardar 5 segundos e a tentar novamente...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return this.launch();
      }

      this.server = this.app.listen(this.port, () => {
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log('API iniciada');
        // eslint-disable-next-line no-console
        console.log('------------------------------');
        // eslint-disable-next-line no-console
        console.log(`Swagger: http://localhost:${this.port}/api-docs`);
        // eslint-disable-next-line no-console
        console.log(`Health: http://localhost:${this.port}/health`);
        // eslint-disable-next-line no-console
        console.log('MaxScale Dashboard: http://localhost:8989');
        // eslint-disable-next-line no-console
        console.log('------------------------------');
        // eslint-disable-next-line no-console
        console.log('');
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao iniciar:', error);
      process.exit(1);
    }
  }

  async close() {
    if (this.server) {
      await this.server.close();
      // eslint-disable-next-line no-console
      console.log(`Servidor na porta ${this.port} foi encerrado`);
    }
  }
}

module.exports = ExpressServer;


