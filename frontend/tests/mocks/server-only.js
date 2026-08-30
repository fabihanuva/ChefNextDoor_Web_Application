// The real `server-only` package throws unconditionally when required
// under the "default" export condition, which is what plain Node/Jest
// resolves to (Next.js's webpack build is what applies the special
// "react-server" condition that swaps it for a no-op in production).
// For unit tests we just want the marker to be inert.
module.exports = {}
