Object.defineProperty(exports, '__esModule', { value: true });

const instrumentationPg = require('@opentelemetry/instrumentation-pg');
const core = require('@sentry/core');
const instrument = require('../../otel/instrument.js');
const addOriginToSpan = require('../../utils/addOriginToSpan.js');

const INTEGRATION_NAME = 'Postgres';

const instrumentPostgres = instrument.generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new instrumentationPg.PgInstrumentation({
      requireParentSpan: true,
      requestHook(span) {
        addOriginToSpan.addOriginToSpan(span, 'auto.db.otel.postgres');
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
const postgresIntegration = core.defineIntegration(_postgresIntegration);

exports.instrumentPostgres = instrumentPostgres;
exports.postgresIntegration = postgresIntegration;
//# sourceMappingURL=postgres.js.map
