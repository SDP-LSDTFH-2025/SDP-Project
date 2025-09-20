/**
 * Swagger Configuration Index
 * Centralized exports for all Swagger configurations
 */

const { generateMainApiSpec } = require('./mainApi');
const { generatePublicApiSpec } = require('./publicApi');

/**
 * Generate all Swagger specifications
 * @param {number} PORT - Server port number
 * @returns {Object} Object containing all Swagger specs
 */
const generateAllSwaggerSpecs = (PORT) => {
  return {
    mainApi: generateMainApiSpec(PORT),
    publicApi: generatePublicApiSpec(PORT)
  };
};

module.exports = {
  generateAllSwaggerSpecs,
  generateMainApiSpec,
  generatePublicApiSpec
};
