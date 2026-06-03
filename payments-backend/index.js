// require("dotenv").config();

// const cors = require("cors");

// const express = require("express");
// const app = express();

// app.use(cors());
// app.use(express.json());


// app.get("/health", (req, res) => {
//     res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
// });


// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//     console.log(`Server on : ${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server on ${PORT}`);
});