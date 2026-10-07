import { setupServer } from "msw/node";

// Each test supplies its own HTTP handlers; unexpected requests fail closed.
export const server = setupServer();
