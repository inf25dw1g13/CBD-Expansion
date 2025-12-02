const path = require('path');
const Controllers = require('../controllers');

function handleError(err, request, response) {
  // eslint-disable-next-line no-console
  console.error(err);
  const code = err.code || 400;
  const errorMessage = typeof err === 'string' ? err : (err.error || err.message || err);
  
  if (!response.headersSent) {
    response.status(code).json({ error: errorMessage });
  }
}

/**
 * The purpose of this route is to collect the request variables as defined in the
 * OpenAPI document and pass them to the handling controller as another Express
 * middleware. All parameters are collected in the request.swagger.values key-value object
 *
 * The assumption is that security handlers have already verified and allowed access
 * to this path. If the business-logic of a particular path is dependent on authentication
 * parameters (e.g. scope checking) - it is recommended to define the authentication header
 * as one of the parameters expected in the OpenAPI/Swagger document.
 *
 *  Requests made to paths that are not in the OpenAPI scope
 *  are passed on to the next middleware handler.
 * @returns {Function}
 */
function openApiRouter() {
  return async (request, response, next) => {
    try {
      /**
       * This middleware runs after a previous process have applied an openapi object
       * to the request.
       * If none was applied This is because the path requested is not in the schema.
       * If there's no openapi object, we have nothing to do, and pass on to next middleware.
       */
      if (request.openapi === undefined
          || request.openapi.schema === undefined
      ) {
        next();
        return;
      }
      
      const operationHandler = request.openapi.schema['x-eov-operation-handler'];
      const operationId = request.openapi.schema.operationId;

      if (!operationHandler || !operationId) {
        next();
        return;
      }

      // Parse handler path: "controllers/RestaurantesController" -> RestaurantesController
      const handlerPath = operationHandler.split('/');
      const controllerName = handlerPath[handlerPath.length - 1];
      const targetController = Controllers[controllerName];

      if (!targetController || typeof targetController[operationId] !== 'function') {
        const errorMsg = `request sent to controller '${controllerName}' / operation '${operationId}' which has not been defined`;
        return handleError({ code: 400, error: errorMsg }, request, response);
      }
      
      // Chamar o método do controller
      await targetController[operationId](request, response, next);
    } catch (error) {
      handleError(error, request, response);
    }
  };
}

module.exports = openApiRouter;

