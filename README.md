# Phantomjs
Install phantomjs: http://phantomjs.org/

# Config
* Rename config.json.sample to config.json
* Fill out username and password.  
* Find the correct cache-path.  
Look here for some ideas: https://stackoverflow.com/questions/24192058/phantomjs-caching-where-it-is-stored

# Run
You might need to ignore ssl-errors and accept any ssl-protocol.
Also remember to enable disk-cache

<code>phantomjs --ignore-ssl-errors=true --ssl-protocol=any --disk-cache=true hafslund.js</code>

# Result
You should now have a brand new hafslund.xlsx in you current directory containing the last months values

# Todo
* Specify period to download data from (now uses the default "last month")
