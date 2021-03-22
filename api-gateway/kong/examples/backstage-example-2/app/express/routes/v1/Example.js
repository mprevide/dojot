const { Logger } = require('@dojot/microservice-sdk');
const HttpStatus = require('http-status-codes');

const logger = new Logger('influxdb-retriever:express/routes/v1/Device');

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
          // checkSession,
          async (req, res) => {
            console.log('internal-test');
            try {
              const { accessToken } = req.session;
              if (accessToken) {
                try {
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
                } catch (error) {
                  if (error.response && error.response.status && error.response.data) {
                    throw new Error(`${error.response.status}: ${JSON.stringify(error.response.data)}`);
                  }
                  throw error;
                }
                res.end();
              } else {
                res.status(403).send({ error: 'Please, login' });
              }
            } catch (error) {
              res.status(500).send({ error: error.message });
            }
          },
        ],
      },
    ],
  };


  return [example];
};
