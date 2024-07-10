Object.defineProperty(exports, '__esModule', { value: true });

const instrumentationConnect = require('@opentelemetry/instrumentation-connect');
const core = require('@sentry/core');
const instrument = require('../../otel/instrument.js');
const ensureIsWrapped = require('../../utils/ensureIsWrapped.js');

const INTEGRATION_NAME = 'Connect';

const instrumentConnect = instrument.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentationConnect.ConnectInstrumentation());

const _connectIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentConnect();
    },
  };
}) ;

const connectIntegration = core.defineIntegration(_connectIntegration);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function connectErrorMiddleware(err, req, res, next) {
  core.captureException(err);
  next(err);
}

const setupConnectErrorHandler = (app) => {
  app.use(connectErrorMiddleware);

  // Sadly, ConnectInstrumentation has no requestHook, so we need to add the attributes here
  // We register this hook in this method, because if we register it in the integration `setup`,
  // it would always run even for users that are not even using connect
  const client = core.getClient();
  if (client) {
    client.on('spanStart', span => {
      addConnectSpanAttributes(span);
    });
  }

  ensureIsWrapped.ensureIsWrapped(app.use, 'connect');
};

function addConnectSpanAttributes(span) {
  const attributes = core.spanToJSON(span).data || {};

  // this is one of: middleware, request_handler
  const type = attributes['connect.type'];

  // If this is already set, or we have no connect span, no need to process again...
  if (attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }

  span.setAttributes({
    [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.http.otel.connect',
    [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.connect`,
  });

  // Also update the name, we don't need to "middleware - " prefix
  const name = attributes['connect.name'];
  if (typeof name === 'string') {
    span.updateName(name);
  }
}

exports.connectIntegration = connectIntegration;
exports.instrumentConnect = instrumentConnect;
exports.setupConnectErrorHandler = setupConnectErrorHandler;
//# sourceMappingURL=connect.js.map
