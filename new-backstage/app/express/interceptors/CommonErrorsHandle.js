const { Logger } = require('@dojot/microservice-sdk');

const logger = new Logger('backstage:express/interceptors/CommonErrorsHandle');
/**
 * Handle  Common Errors
 *
 * @returns an express middleware to handle common errors.
 */
module.exports = () => (
  /**
   * Middleware to be registered in express as an error handler
   */
  (err, req, res, next) => {
    logger.error('error: ', err);
    if (err.response && err.response.status && err.response.data) {
      const {
        status,
        data: {
          error: errorTxt,
          error_description: errorDesc,
          message: messageError,
        },
      } = err.response;
      if (errorTxt && !errorDesc) {
        return res.status(status).json({ error: errorTxt });
      } if (errorTxt && errorDesc) {
        return res.status(status).json({ error: `${errorTxt}: ${errorDesc}` });
      } if (messageError) {
        return res.status(status).json({ error: messageError });
      }
    }
    return next(err);
  }
);
