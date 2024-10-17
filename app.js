const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const path = require("node:path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const indexRoute = require("./routes/indexRoute");

app.use(express.urlencoded({ extended: true }));
app.use("/", indexRoute);

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
