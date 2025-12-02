const path = require('path');
const ExpressServer = require('./expressServer');
const PORT = process.env.PORT || 3000;
const apiSpec = path.join(__dirname, 'api/openapi.yaml');

const launchServer = async () => {
  try {
    const expressServer = new ExpressServer(PORT, apiSpec);
    await expressServer.launch();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Express Server failure', error.message);
  }
};

launchServer();
