const port = Number(process.env.PORT ?? 3000);
const adminUsername = process.env.ADMIN_USERNAME?.trim() ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';
const sessionSecret = process.env.SESSION_SECRET ?? '';

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}
if (adminUsername.length < 3 || adminUsername.length > 64) {
  throw new Error('ADMIN_USERNAME must be between 3 and 64 characters.');
}
if (Buffer.byteLength(adminPassword) < 16) {
  throw new Error('ADMIN_PASSWORD must contain at least 16 bytes.');
}
if (Buffer.byteLength(sessionSecret) < 32) {
  throw new Error('SESSION_SECRET must contain at least 32 bytes.');
}

export const serverConfig = {
  port,
  host: process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'),
  adminUsername,
  adminPassword,
  sessionSecret,
};
