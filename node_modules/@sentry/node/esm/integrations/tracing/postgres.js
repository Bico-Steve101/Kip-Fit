import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { defineIntegration } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';
import { addOriginToSpan } from '../../utils/addOriginToSpan.js';

const INTEGRATION_NAME = 'Postgres';

const instrumentPostgres = generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new PgInstrumentation({
      requireParentSpan: true,
      requestHook(span) {
        addOriginToSpan(span, 'auto.db.otel.postgres');
      },
    }),
);

const _postgresIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentPostgres();
    },
  };
}) ;

/**
 * Postgres integration
 *
 * Capture tracing data for pg.
 */
const postgresIntegration = defineIntegration(_postgresIntegration);

export { instrumentPostgres, postgresIntegration };
//# sourceMappingURL=postgres.js.map
