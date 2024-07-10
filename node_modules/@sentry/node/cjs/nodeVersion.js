Object.defineProperty(exports, '__esModule', { value: true });

const utils = require('@sentry/utils');

const NODE_VERSION = utils.parseSemver(process.versions.node) ;
const NODE_MAJOR = NODE_VERSION.major;

exports.NODE_MAJOR = NODE_MAJOR;
exports.NODE_VERSION = NODE_VERSION;
//# sourceMappingURL=nodeVersion.js.map
