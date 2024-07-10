Object.defineProperty(exports, '__esModule', { value: true });

const instrumentationMongoose = require('@opentelemetry/instrumentation-mongoose');
const core = require('@sentry/core');
const instrument = require('../../otel/instrument.js');
const addOriginToSpan = require('../../utils/addOriginToSpan.js');

const INTEGRATION_NAME = 'Mongoose';

const instrumentMongoose = instrument.generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new instrumentationMongoose.MongooseInstrumentation({
      responseHook(span) {
        addOriginToSpan.addOriginToSpan(span, 'auto.db.otel.mongoose');
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
const mongooseIntegration = core.defineIntegration(_mongooseIntegration);

exports.instrumentMongoose = instrumentMongoose;
exports.mongooseIntegration = mongooseIntegration;
//# sourceMappingURL=mongoose.js.map
