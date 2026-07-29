import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./config/db";

const server = app.listen(env.port, () => {
  console.log(`EWA Senegal API démarrée sur http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} reçu, arrêt propre du serveur...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
