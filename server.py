from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import unquote_plus


def get_body_params(body):
    if not body:
        return {}
    parameters = body.split("&")

    # split each parameter into a (key, value) pair, and escape both
    def split_parameter(parameter):
        k, v = parameter.split("=", 1)
        k_escaped = unquote_plus(k)
        v_escaped = unquote_plus(v)
        return k_escaped, v_escaped

    body_dict = dict(map(split_parameter, parameters))
    print(f"Parsed parameters as: {body_dict}")
    # return a dictionary of the parameters
    return body_dict


def submission_to_table(item):
    """
       The HTML row will be in the same format as a row on your schedule

    An example input dictionary might look like: 
    {
     'event': 'Sleep',
     'day': 'Sun',
     'start': '01:00',
     'end': '11:00', 
     'phone': '1234567890', 
     'location': 'Home',
     'url': 'https://example.com'
    }
    """
    return f'''
    <tr>
        <td>{item["event"]}</td>
        <td>{item["day"]}</td>
        <td>{item["start"]}</td>
        <td>{item["end"]}</td>
        <td>{item["phone"]}</td>
        <td>{item["location"]}</td>
        <td><a href="{item['url']}">More Info</a></td>
    </tr>
    '''


# NOTE: Please read the updated function carefully, as it has changed from the
# version in the previous homework. It has important information in comments
# which will help you complete this assignment.
def handle_req(url, body=None):
    """
    The url parameter is a *PARTIAL* URL of type string that contains the path
    name and query string.

    If you enter the following URL in your browser's address bar:
    `http://localhost:4131/myform.html?name=joe` then the `url` parameter will have
    the value "/MyForm.html?name=joe"

    This function should return two strings in a list or tuple. The first is the
    content to return, and the second is the content-type.
    """

    # Get rid of any query string parameters
    url, *_ = url.split("?", 1)
    # Parse any form parameters submitted via POST
    parameters = get_body_params(body)

    # HTML
    if url == "/":
        return open("static/html/index.html").read(), "text/html"
    if url == "/html/myschedule":
        return open("static/html/myschedule.html").read(), "text/html"
    if url == "/html/myform":
        return open("static/html/myform.html").read(), "text/html"
    elif url == "/html/aboutme":
        return open("static/html/aboutme.html").read(), "text/html"
    elif url == "/myform":
        return open("static/html/myform.html").read(), "text/html"
    elif url == "/html/stocks":
        return open("static/html/stocks.html").read(), "text/html"
    # CSS
    elif url == "/css/styles.css":
        return open("static/css/styles.css").read(), "text/css"
    # JS
    elif url == "/js/jquery-3.7.1.min.js":
        return open("static/js/jquery-3.7.1.min.js").read(), "application/javascript"
    elif url == "/js/script_myschedule.js":
        return open("static/js/script_myschedule.js").read(), "text/javascript"
    elif url == "/js/script_aboutme.js":
        return open("static/js/script_aboutme.js").read(), "text/javascript"
    elif url == "/js/map.js":
        return open("static/js/map.js").read(), "text/javascript"
    elif url == "/js/stocks.js":
        return open("static/js/stocks.js").read(), "application/javascript"
    # IMG
    elif url == "/img/gophers-mascot.png":
        return open("static/img/gophers-mascot.png", "br").read(), "image/png"
    elif url == "/img/favicon.ico":
        return open("static/img/favicon.ico", "br").read(), "image/x-icon"
    elif url == "/img/anderson.jpg":
        return open("static/img/anderson.jpg", "br").read(), "image/jpeg"
    elif url == "/img/walter.jpg":
        return open("static/img/walter.jpg", "br").read(), "image/jpeg"
    elif url == "/img/recwell.jpg":
        return open("static/img/recwell.jpg", "br").read(), "image/jpeg"
    elif url == "/img/home.jpg":
        return open("static/img/home.jpg", "br").read(), "image/jpeg"
    elif url == "/img/keller.jpg":
        return open("static/img/keller.jpg", "br").read(), "image/jpeg"
    elif url == "/img/moa.jpg":
        return open("static/img/moa.jpg", "br").read(), "image/jpeg"
    elif url == "/img/online.jpeg":
        return open("static/img/online.jpeg", "br").read(), "image/jpeg"
    # NOTE: The files you return will likely be different for your server, but the code to
    # show you examples of how yours may look. You will need to change the paths
    # to match the files you want to serve. Before you do that, make sure you
    # understand what the code is doing, specifically with the MIME types and
    # opening some files in binary mode, i.e. `open(..., "br")`.
    # implement the `submission_to_table`.
    elif url == "/html/EventLog.html":
        required_keys = ["event", "day", "start", "end", "phone", "location", "url"]
        if not all(key in parameters for key in required_keys):
            return "Missing form parameters", "text/plain"
        return (
            """
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Event Submission</title>
                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <nav class="navbar">
                    <a href="/" class="logo"><img src="/img/favicon.ico" alt="CSCI4131 icon"></a>
                    <div class="nav-links">
                        <a href="/aboutme">About Me</a>
                        <a href="/myschedule">My Schedule</a>
                        <a href="/myform">Form Input</a>
                    </div>
                </nav>
                <h1>My New Events</h1>
                <div class="main schedule-main" style="display: block; position: relative;">
                    <div class="main-left" style="width: 100%;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Day</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Phone</th>
                                    <th>Location</th>
                                    <th>URL</th>
                                </tr>
                            </thead>
                            <tbody>
                            """
            + submission_to_table(parameters)
            + """
                            </tbody>
                        </table>
                    </div>
                </div>
                <footer>
                    <div class="footer-container">
                        <div class="footer-left">
                            <div class="footer-links">
                                <a href="https://www.linkedin.com/in/gustavo-sakamoto-de-toledo-3120a0240/">LinkedIn</a>
                                <a href="mailto:gustavosakamotox@gmail.com">Email</a>
                                <a href="https://www.instagram.com/gustavo.sakamoto.toledo/">Instagram</a>
                            </div>
                        </div>
                    </div>
                    <p>&copy; Copyright 2025 by Gustavo Sakamoto de Toledo</p>
                </footer>
            </body>
        </html>""",
            "text/html; charset=utf-8",
        )
    else:
        return open("static/html/404.html").read(), "text/html; charset=utf-8"


# Don't change content below this. It would be best if you just left it alone.


class RequestHandler(BaseHTTPRequestHandler):
    def __c_read_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        body = str(body, encoding="utf-8")
        return body

    def __c_send_response(self, message, response_code, headers):
        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")

        # Send the first line of response.
        self.protocol_version = "HTTP/1.1"
        self.send_response(response_code)

        # Send headers (plus a few we'll handle for you)
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header("Content-Length", len(message))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()

        # Send the file.
        self.wfile.write(message)

    def do_GET(self):
        # Call the student-edited server code.
        message, content_type = handle_req(self.path)

        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")

        self.__c_send_response(
            message,
            200,
            {
                "Content-Type": content_type,
                "Content-Length": len(message),
                "X-Content-Type-Options": "nosniff",
            },
        )

    def do_POST(self):
        body = self.__c_read_body()
        message, content_type = handle_req(self.path, body)

        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")

        self.__c_send_response(
            message,
            200,
            {
                "Content-Type": content_type,
                "Content-Length": len(message),
                "X-Content-Type-Options": "nosniff",
            },
        )


def run():
    PORT = 8000
    print(f"Starting server http://localhost:{PORT}/")
    server = ("", PORT)
    httpd = HTTPServer(server, RequestHandler)
    httpd.serve_forever()


run()
