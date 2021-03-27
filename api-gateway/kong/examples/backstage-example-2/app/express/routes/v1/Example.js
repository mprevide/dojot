const { Logger } = require('@dojot/microservice-sdk');
const HttpStatus = require('http-status-codes');

const logger = new Logger('backstage:express/routes/v1/Device');

const { default: axios } = require('axios');

const INTERNAL_TEST_URL = 'http://apigw:8000/secure';

/**
 * Routes to Devices
 *
 * @param {string} mountPoint be used as a route prefix
 * @param {Promise<{result: object, totalItems: number}| error>>} queryDataByField
 *                               A promise that returns a result and a totalItems inside that result
 * @param {Promise<{result: object, totalItems: number}| error>>} queryDataByMeasurement
 *                               A promise that returns a result and a totalItems inside that result
 */
module.exports = ({ mountPoint }) => {
/**
 *
 */
  // const checkSession = (req, res, next) => {
  //   if (!req.session) {
  //     // return error();
  //   }
  //   return next();
  // };

  /**
   * This feature returns data for an device with time
   * filter, pagination and order
   */
  const example = {
    mountPoint,
    name: 'auth-route',
    path: ['/example'],
    handlers: [
      {
        method: 'get',
        middleware: [
          async (req, res) => {
            const { accessToken } = req.session;
            if (accessToken) {
              const result = await axios.get(
                INTERNAL_TEST_URL,
                {
                  headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              );
              res.status(200).json(result.data);
            }
          },
        ],
      },
    ],
  };

  //   HTTP/1.1 401 Unauthorized
  // {"message":"Bad token; invalid JSON"}
  // HTTP/1.1 403 Forbidden
  // {"error":"access_denied","error_description":"not_authorized"}
  // HTTP/1.1 403 Forbidden
  // {"message":"Invalid algorithm"}
  // HTTP/1.1 401 Unauthorized
  // {"message":"Token claims invalid: [\"exp\"]=\"token expired\""}

  return [example];
};
