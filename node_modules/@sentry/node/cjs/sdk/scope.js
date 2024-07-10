Object.defineProperty(exports, '__esModule', { value: true });

const api = require('@opentelemetry/api');
const opentelemetry = require('@sentry/opentelemetry');

/**
 * Update the active isolation scope.
 * Should be used with caution!
 */
function setIsolationScope(isolationScope) {
  const scopes = opentelemetry.getScopesFromContext(api.context.active());
  if (scopes) {
    scopes.isolationScope = isolationScope;
  }
}

exports.setIsolationScope = setIsolationScope;
//# sourceMappingURL=scope.js.map
