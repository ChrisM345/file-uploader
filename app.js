const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const path = require("node:path");

const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const indexRoute = require("./routes/indexRoute");
const fileRoute = require("./routes/fileRoute");

// app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use("/", indexRoute);
app.use("/folder", fileRoute);
app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.redirect("/errorPage");
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
