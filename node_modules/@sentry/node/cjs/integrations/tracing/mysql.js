Object.defineProperty(exports, '__esModule', { value: true });

const instrumentationMysql = require('@opentelemetry/instrumentation-mysql');
const core = require('@sentry/core');
const instrument = require('../../otel/instrument.js');

const INTEGRATION_NAME = 'Mysql';

const instrumentMysql = instrument.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentationMysql.MySQLInstrumentation({}));

const _mysqlIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentMysql();
    },
  };
}) ;

/**
 * MySQL integration
 *
 * Capture tracing data for mysql.
 */
const mysqlIntegration = core.defineIntegration(_mysqlIntegration);

exports.instrumentMysql = instrumentMysql;
exports.mysqlIntegration = mysqlIntegration;
//# sourceMappingURL=mysql.js.map
