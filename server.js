const express = require('express');
const path = require('path');
const morgan = require('morgan');
const axios = require('axios');
const mysql = require('mysql2');
const rfs = require('rotating-file-stream');
const uuid = require('node-uuid');

const CRLF = '\r\n';
const app = express();
const hostname = 'localhost';
const port = process.env.PORT || 4131;
const width = process.stdout.columns || 80;
const db_credentials = {
    host: 'cse-mysql-classes-01.cse.umn.edu',
    port: 3306,
    username: 'C4131S25S01U38',
    database: 'C4131S25S01U38',
    password: 'StrongPassword123'
};
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', path: path.join(__dirname, 'logs/access.log')
})
const staticDir = path.join(__dirname, 'static');
const htmlDir = (path.join(staticDir, 'html'));
const jsDir = path.join(staticDir, 'js');
const cssDir = path.join(staticDir, 'css');
const imgDir = path.join(staticDir, 'img');

/*
    DATABASE
 */
const conn = mysql.createConnection({
    host: db_credentials.host,
    user: db_credentials.username,
    password: db_credentials.password,
    port: db_credentials.port,
    database: db_credentials.database,
});
conn.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.message);
    }
    console.log("Connected to MySQL database...");
    console.log('='.repeat(width));
});

/*
    LOGS
 */
morgan.token('id', function getId (req) {
    return req.id;
})
app.use(assignId);
app.use(morgan(':id :remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" Status::status Content-Length::res[content-length]', {stream: accessLogStream}));
function assignId (req, res, next) {
    req.id = uuid.v4();
    next();
}

/*

/*
    MIDDLEWARE
 */
app.use(express.static(htmlDir));
app.use('/js', express.static(jsDir));
app.use('/css', express.static(cssDir));
app.use('/img', express.static(imgDir));


/*
    HTML Files
 */

app.route('/about')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'aboutme.html')));

app.route('/form')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'myform.html')));

app.route('/schedule')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'myschedule.html')));
app.route('/stocks')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'stocks.html')));

app.route('/')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'index.html')));

/*
    PROXY
 */
app.get('/proxy/linkedin-image', async (req, res) => {
    try {
        const linkedinUrl = 'https://media.licdn.com/dms/image/v2/D5603AQE4qqs8vA8BtQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1679529577149?e=1749081600&v=beta&t=XUAWnXPy3irTnLGnEfLpxd2b9xfT93edTWiCxggftfk';

        // Fetch image from LinkedIn
        const response = await axios.get(linkedinUrl, {
            responseType: 'stream', headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        res.set({
            'Content-Type': response.headers['content-type'], 'Cache-Control': 'public, max-age=86400'
        });
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error');
        res.status(500).send('Failed to fetch image');
    }
});

const server = app.listen(port, () => {
    console.log('='.repeat(width));
    // noinspection HttpUrlsUsage
    console.log(`Listening on port http://${hostname}:${port}`);
    console.log('='.repeat(width));
});

process.on('SIGINT', () => {
    console.log(`${CRLF}Closing database connection and shutting down`);
    console.log(`=`.repeat(width));
    conn.end(err => {
        if (err) console.error('Error closing connection:', err.message);
        server.close(() => {
            console.log('Server terminated');
            console.log(`=`.repeat(width));
            process.exit(0);
        });
    });
});

process.on('SIGTERM', () => {
    console.log(`${CRLF}Received SIGTERM. Closing database connection`);
    console.log(`=`.repeat(width));
    conn.end(err => {
        if (err) console.error('Error closing connection:', err.message);
        server.close(() => {
            console.log('Server terminated');
            console.log(`=`.repeat(width));
            process.exit(0);
        });
    });
});