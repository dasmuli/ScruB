# ScruB
ScruB is a lean personal and small team scrum-like task planer. It is based on node and html 5. See demo.

The demo is available on my dynamic dns server http://zerozerozero.dd-dns.de. I use this site for my small projects, so data backup is given.

# Screenshots
![Chart](/screenshots/Chart.png?raw=true = 250x "Chart")
![Open issues](/screenshots/Open.png?raw=true "Open issues")
![Edit dialog](/screenshots/EditDialog.png?raw=true "Edit dialog")

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

# Background
As this was a test project to get to know node and socket.io, the code is rather sub standard. But as the app works and being quite fast for a slow low power arm server, I am rather happy with the result.
