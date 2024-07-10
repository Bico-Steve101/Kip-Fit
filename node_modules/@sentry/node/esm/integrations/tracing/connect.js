import { ConnectInstrumentation } from '@opentelemetry/instrumentation-connect';
import { defineIntegration, getClient, spanToJSON, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, captureException } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';
import { ensureIsWrapped } from '../../utils/ensureIsWrapped.js';

const INTEGRATION_NAME = 'Connect';

const instrumentConnect = generateInstrumentOnce(INTEGRATION_NAME, () => new ConnectInstrumentation());

const _connectIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentConnect();
    },
  };
}) ;

const connectIntegration = defineIntegration(_connectIntegration);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function connectErrorMiddleware(err, req, res, next) {
  captureException(err);
  next(err);
}

const setupConnectErrorHandler = (app) => {
  app.use(connectErrorMiddleware);

  // Sadly, ConnectInstrumentation has no requestHook, so we need to add the attributes here
  // We register this hook in this method, because if we register it in the integration `setup`,
  // it would always run even for users that are not even using connect
  const client = getClient();
  if (client) {
    client.on('spanStart', span => {
      addConnectSpanAttributes(span);
    });
  }

  ensureIsWrapped(app.use, 'connect');
};

function addConnectSpanAttributes(span) {
  const attributes = spanToJSON(span).data || {};

  // this is one of: middleware, request_handler
  const type = attributes['connect.type'];

  // If this is already set, or we have no connect span, no need to process again...
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }

  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.http.otel.connect',
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.connect`,
  });

  // Also update the name, we don't need to "middleware - " prefix
  const name = attributes['connect.name'];
  if (typeof name === 'string') {
    span.updateName(name);
  }
}

export { connectIntegration, instrumentConnect, setupConnectErrorHandler };
//# sourceMappingURL=connect.js.map
