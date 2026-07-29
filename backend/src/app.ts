import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { apiRateLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Requêtes sans en-tête Origin (ex: curl, outils serveur-à-serveur) autorisées.
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origine non autorisée par la politique CORS."));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(apiRateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ewa-senegal-backend" });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);
