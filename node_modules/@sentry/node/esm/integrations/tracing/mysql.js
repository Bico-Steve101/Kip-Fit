import { MySQLInstrumentation } from '@opentelemetry/instrumentation-mysql';
import { defineIntegration } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';

const INTEGRATION_NAME = 'Mysql';

const instrumentMysql = generateInstrumentOnce(INTEGRATION_NAME, () => new MySQLInstrumentation({}));

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
const mysqlIntegration = defineIntegration(_mysqlIntegration);

export { instrumentMysql, mysqlIntegration };
//# sourceMappingURL=mysql.js.map
