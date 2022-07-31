# Instructions to run the React App
1. Open a terminal and split it into separate ones
2. Execute tsc -w
3. Execute BROWSER=chromium port=8080 npm start

# Solve problem with CORS to test front to back connection
- Source: https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome 
- Steps:
1. Create a folder p.e. "disableCORS" and another one inside called "data"
2. Execute the following command
	chromium-browser --disable-web-security --user-data-dir="/home/kali/TFM/secure_vault/disableCORS/data"