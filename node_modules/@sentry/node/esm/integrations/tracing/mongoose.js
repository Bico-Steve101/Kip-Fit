import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose';
import { defineIntegration } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';
import { addOriginToSpan } from '../../utils/addOriginToSpan.js';

const INTEGRATION_NAME = 'Mongoose';

const instrumentMongoose = generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new MongooseInstrumentation({
      responseHook(span) {
        addOriginToSpan(span, 'auto.db.otel.mongoose');
      },
    }),
);

const _mongooseIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentMongoose();
    },
  };
}) ;

/**
 * Mongoose integration
 *
 * Capture tracing data for Mongoose.
 */
const mongooseIntegration = defineIntegration(_mongooseIntegration);

export { instrumentMongoose, mongooseIntegration };
//# sourceMappingURL=mongoose.js.map
