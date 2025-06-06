require('dotenv').config(); // Loads environment variables

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const axios = require('axios');
const mysql = require('mysql2');
const sanitizeHtml = require('sanitize-html');
const rfs = require('rotating-file-stream');
const uuid = require('node-uuid');
const methodOverride = require('method-override');

const CRLF = '\r\n';
const app = express();
const router = express.Router();
const hostname = 'localhost';
const port = process.env.PORT || 4131;
const width = process.stdout.columns || 80;
const db_credentials = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS
};
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', path: path.join(__dirname, 'logs/access.log')
})
const staticDir = path.join(__dirname, 'static');
const htmlDir = path.join(staticDir, 'html');
const jsDir = path.join(staticDir, 'js');
const cssDir = path.join(staticDir, 'css');
const imgDir = path.join(staticDir, 'img');

/*
    DATABASE
 */
const connection = mysql.createConnection({
    host: db_credentials.host,
    user: db_credentials.user,
    password: db_credentials.password,
    port: db_credentials.port,
    database: db_credentials.database,
});
/*
    Preprocessor
 */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/*
    LOGS
 */
morgan.token('id', function getId(req) {
    return req.id;
})
app.use(assignId);
app.use(morgan(':id :remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" Status::status Content-Length::res[content-length]', {stream: accessLogStream}));

function assignId(req, res, next) {
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
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
const validateEventInput = (req, res, next) => {
    const requiredFields = ['event', 'day', 'start', 'end', 'phone', 'location', 'url'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields > 0) {
        return res.status(400).send({
            error: 'Missing required field(s)',
            missing: missingFields
        });
    }

    if (!/^\d{3}-\d{3}-\d{4}$/.test(req.body.phone)) {
        return res.status(400).json({error: 'Invalid phone format'});
    }
    next();
};


/*
    HTML Files
 */

app.route('/about')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'aboutme.html')));

app.route('/form')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'add-event.html')));

app.route('/schedule')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'myschedule.html')));

app.route('/stocks')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'stocks.html')));

app.route('/')
    .get((req, res) => res.sendFile(path.join(htmlDir, 'index.html')));

/*
    Schedule Database Collection Routes
 */
app.route('/event')
    .post(validateEventInput, (req, res) => {
        const sanitizedData = {
            event: sanitizeHtml(req.body.event),
            day: sanitizeHtml(req.body.day),
            start: sanitizeHtml(req.body.start),
            end: sanitizeHtml(req.body.end),
            phone: sanitizeHtml(req.body.phone),
            location: sanitizeHtml(req.body.location),
            url: sanitizeHtml(req.body.url),
        };

        connection.query('INSERT schedule SET ?', sanitizedData, (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({error: 'Database error'});
            }

            // File handling remains the same
            fs.readFile(path.join(htmlDir, 'newSubmission.html'), 'utf8', (err, htmlFileContents) => {
                if (err) {
                    console.error('File read error:', err);
                    return res.status(500).send('Internal server error');
                }

                const newHtmlRow = `
                    <tr>
                        <td>${escapeHtml(sanitizedData.day)}</td>
                        <td>${escapeHtml(sanitizedData.event)}</td>
                        <td>${escapeHtml(sanitizedData.start)} - ${escapeHtml(sanitizedData.end)}</td>
                        <td>${escapeHtml(sanitizedData.location)}</td>
                        <td>${escapeHtml(sanitizedData.phone)}</td>
                        <td><a href="${encodeURI(sanitizedData.url)}" target="_blank">Link</a></td>
                    </tr>
                `;
                const updatedHtml = htmlFileContents.replace(
                    '<tbody id="table-body">',
                    `<tbody id="table-body">\n${newHtmlRow}`
                );

                res.status(201).type('html').send(updatedHtml);
            });
        });
    })
    .get((req, res) => {
        connection.query('SELECT * FROM schedule', (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({error: 'Database error'});
            }
            res.status(200).json(rows);
        });
    })
    .delete((req, res) => {
        const {id} = req.body;

        if (!id) {
            return res.status(400).json({error: 'Missing event ID'});
        }

        connection.query('DELETE FROM schedule WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({error: 'Database error'});
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({error: 'Event not found'});
            }

            res.status(200).json({message: 'Event deleted successfully'});
        });
    });

app.route('/event/:id')
    .patch(validateEventInput, (req, res) => {
        const eventId = req.params.id;

        if (!eventId || isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID format' });
        }

        const sanitizedData = {
            event: sanitizeHtml(req.body.event),
            day: sanitizeHtml(req.body.day),
            start: sanitizeHtml(req.body.start),
            end: sanitizeHtml(req.body.end),
            phone: sanitizeHtml(req.body.phone),
            location: sanitizeHtml(req.body.location),
            url: sanitizeHtml(req.body.url),
        };

        connection.query('UPDATE schedule SET ? WHERE id = ?',
            [sanitizedData, eventId],
            (err) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.redirect('/schedule');
            }
        );
    });

app.route('/editSchedule/:EventId')
    .get((req, res) => {
        const eventId = req.params.EventId;

        // No event ID or Not a number
        if (!eventId || isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID format' });
        }

        connection.query('SELECT * FROM schedule WHERE id = ?', [eventId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({error: 'Database error'});
            }

            // No event matches the requested ID
            if (results.length === 0) {
                return res.status(404).json({error: 'Event not found'});
            }

            res.render('pages/editSchedule', { row: results[0] });
        });
    });

module.exports = router;
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

/*
    Other Functions & Handlers
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

app.use((req, res) => {
    res.status(404).sendFile(path.join(htmlDir, '404.html'));
});

/*
    Server Interface
 */
connection.connect((err) => {
    console.error('='.repeat(width));
    console.log('[+] Server Initiating...');
    if (err) {
        console.error('[-] Failed to connect to database:', err);
        process.exit(1);
    }

    console.log(`=`.repeat(width));
    console.log('[+] Connected to database.');

    const server = app.listen(port, () => {
        console.log('='.repeat(width));
        console.log(`[+] Listening on port http://${hostname}:${port}.`);
        console.log('='.repeat(width));
    });

    process.on('SIGINT', () => {
        console.log(`${CRLF}[+] Closing database connection and shutting down.`);
        console.log(`=`.repeat(width));
        connection.end(err => {
            if (err) console.error('[-] Error closing connection:', err.message);
            server.close(() => {
                console.log('[+] Server terminated');
                console.log(`=`.repeat(width));
                process.exit(0);
            });
        });
    });
});

connection.on('error', (err) => {
   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
       console.error('[-] Database connection was closed.');
   } else {
       console.error('[-] Database connection error:', err);
   }
});