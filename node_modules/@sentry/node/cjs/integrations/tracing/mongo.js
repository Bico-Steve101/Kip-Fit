Object.defineProperty(exports, '__esModule', { value: true });

const instrumentationMongodb = require('@opentelemetry/instrumentation-mongodb');
const core = require('@sentry/core');
const instrument = require('../../otel/instrument.js');
const addOriginToSpan = require('../../utils/addOriginToSpan.js');

const INTEGRATION_NAME = 'Mongo';

const instrumentMongo = instrument.generateInstrumentOnce(
  INTEGRATION_NAME,
  () =>
    new instrumentationMongodb.MongoDBInstrumentation({
      responseHook(span) {
        addOriginToSpan.addOriginToSpan(span, 'auto.db.otel.mongo');
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
const mongoIntegration = core.defineIntegration(_mongoIntegration);

exports.instrumentMongo = instrumentMongo;
exports.mongoIntegration = mongoIntegration;
//# sourceMappingURL=mongo.js.map
