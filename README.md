# Project Description
> This is the final implementation of the Express.JS server developed throughout the weeks of work
> in the class CSCI 4131 with Dan Challou. A few personal touches were added, such as logging, HTML
> escaping and other security focused additions to the server. The server must have a .env file
> set up for configuring the database and localhost port to be used by the server process. The
> server can be run using the following:
```bash
$ node server.js
```
> Some of the required Node.JS packages include:
- dotent
- express
- fs
- path
- morgan
- axios
- mysql2
- sanitize-html
- node-uuid
- method-override
> Logs of server actions are logged to access.log in the /logs folder. The web application folder
> structure looks like the following:
- .
  - static/
    - html/
    - css/
    - img/
    - js/
  - views/
    - pages/
    - partials/
  - .env
  - .gitignore
  - package.json
  - package-lock.json
  - server.js
  - server.py # Only for comparison purposes with current server code
 
# Author
- Gustavo Sakamoto de Toledo (GroodInWar)

# Version
- Current version was published on May 2025
