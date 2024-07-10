import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { defineIntegration } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';
import { addOriginToSpan } from '../../utils/addOriginToSpan.js';

const INTEGRATION_NAME = 'Mongo';

const instrumentMongo = generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new MongoDBInstrumentation({
      responseHook(span) {
        addOriginToSpan(span, 'auto.db.otel.mongo');
      },
    }),
);

const _mongoIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentMongo();
    },
  };
}) ;

/**
 * MongoDB integration
 *
 * Capture tracing data for MongoDB.
 */
const mongoIntegration = defineIntegration(_mongoIntegration);

export { instrumentMongo, mongoIntegration };
//# sourceMappingURL=mongo.js.map
