const express = require("express")
const app = express()
const http = require('http');
const connectDB = require("./connections/mongoConnection")
const cors = require("cors")
const morgan = require("morgan")
const dotenv = require("dotenv")
const bodyParser = require("body-parser");
const path = require("path")
const { swaggerUi, specs, uiOptions } = require("./docs/swaggerHandler")
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, uiOptions));
app.set('trust proxy', true);
const { green, yellow } = require("colors")
dotenv.config({ path: "/.env" })
app.use(bodyParser.json({ limit: "1000mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "1000mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev") || morgan("combined"));
app.use(express.static('templates'));
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB()



const hostName = process.env.HOST_NAME || "localhost";
const port = process.env.PORT || 8686;
const server = http.createServer(app);


app.use('/user', require('./routes/userRoute'))
app.use('/admin', require('./routes/adminRoute'))
app.use('/teacher', require('./routes/teacherRoute'))

server.listen(port, () => {
    console.log(`Server running at ${hostName}:${port}`.magenta);
    console.log(`API Documentation available at ${hostName}:${port}/api-docs`.green);
});