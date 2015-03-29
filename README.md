# ScruB
ScruB is a lean personal and small team scrum-like task planer. It is based on node and html 5. See demo.

The demo is available on my dynamic dns server http://zerozerozero.dd-dns.de. I use this site for my small projects, so data backup is given.

The app is very loosely based on http://en.wikipedia.org/wiki/Scrum_(software_development). The main focus is to plan the next features of software, so it is important to change the order of planned features. This can be done using the arrows next to a features within the app. The other benefit is to get empirical data from finishing features over time. By estimating the complexity / effort needed to fullfill a feature, one can get a weekly estimation of project progress. The estimation of complexity / effort is accomplished in teams using planning poker (http://en.wikipedia.org/wiki/Planning_poker).

# Screenshots
![Chart](/screenshots/Chart.png?raw=true =150x "Chart")
![Open issues](/screenshots/Open.png?raw=true =100x "Open issues")
![Edit dialog](/screenshots/EditDialog.png?raw=true =80x  "Edit dialog")

# Features
* Add issues with complexity and description
* Change order of issues
* Set "done" for issues
* Reopen issues
* Chart for feature size burndown
* Realtime changes - changes made by other users directly shown 
* Runs on (my) mobile :)
* Anonymous access for testing
* Nothing more because who cares

# Technical
* Communication is based on commands: Adding issues, moving up, updating text, ...
* No database. Data is stored in json format on disk. Handling is done by an object.
* Main data is collected in one big sized (medium in fact) array, handled by ScrumDataManager.js both on server and client.

# Installation
Regarding installation, node.js is needed along with npm. In order to required libraries, npm install should get all dependencies.

# Background
As this was a test project to get to know node and socket.io, the code is rather sub standard. But as the app works and as it is quite fast for my slow low power arm server, I am rather happy with the result.
The ugly design issues comprise global objects, an eval statement and no modularization in general. A last point added lately is the feature that client opens a websocket based on the URL, because the URL contains the database to be opened. The server on the other hand ignore supdirectories, which is a bit harsh. 
