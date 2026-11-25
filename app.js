require("dotenv").config({ quiet: true });
const express = require("express");
const session = require("express-session");
const path = require("path");
const routes = require("./routes");
const { passLoginStatus } = require("./middlewares/authMiddleware");
const { runStartupMigrations } = require("./database/migrations");
const { startInactiveUserJob } = require("./jobs/inactiveUserJob");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "lably-secret-key",
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(passLoginStatus);

// 2. Startup schema checks & background jobs
runStartupMigrations();
startInactiveUserJob();

// 3. Router
app.use("/", routes);

// 4. Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
