import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';
import { defineIntegration } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';
import { addOriginToSpan } from '../../utils/addOriginToSpan.js';

const INTEGRATION_NAME = 'Mysql2';

const instrumentMysql2 = generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new MySQL2Instrumentation({
      responseHook(span) {
        addOriginToSpan(span, 'auto.db.otel.mysql2');
      },
    }),
);

const _mysql2Integration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentMysql2();
    },
  };
}) ;

/**
 * MySQL2 integration
 *
 * Capture tracing data for mysql2
 */
const mysql2Integration = defineIntegration(_mysql2Integration);

export { instrumentMysql2, mysql2Integration };
//# sourceMappingURL=mysql2.js.map
