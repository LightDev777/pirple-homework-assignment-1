/* Create and export environment variables
*
*/

// general container for all the environments

var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 8880,
  'httpsPort' : 8881,
  'envName' : 'staging'
};


// Production environment
environments.production = {
  'httpPort' : 9990,
  'httpsPort': 9991,
  'envName' : 'production'
};


// Determine which environment to be used
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';


// Check that the current environment is one of the environments above, if not, default to staginig 
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;