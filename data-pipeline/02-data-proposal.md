### 2a. Data Pipeline 

**Proposal Due August 14th**

**Code Due August 21st**

The data pipeline will get your data from your source to your map. For some, this may be a geojson ajax call, like we were doing in the early leaflet maps. And for others, this map be a more involved pipeline involving data processing or making the data available as tiles or through other formats.


#### Proposal

The proposal is a short description, building on your project proposal, of what tools you'll make use of to get your data from source => map. It should be similar but more specifically identify the tools needed.


#### My Data Pipeline Proposal

I will start by scraping restaurant score data from [Washington County's Restaurant Inspections](http://www.co.washington.or.us/HHS/EnvironmentalHealth/FoodSafety/restaurant-inspections.cfm) site. I am doing this by writing an immediately-invoked function expression, and then copying and pasting it into the console of the site. This will create a list of elements from the search results, which will then be parsed and saved as a JSON file. I will do this for each city.

I then will take each of these JSON files and match it against the [Zomato API](https://developers.zomato.com/api). This API has restaurant data such as customer ratings, types of cuisine served, price range, and most importantly latitude and longitude location data. Rather than geocode the addresses directly from the restaurant inspection site directly, I'm going to search for each restaurant with the Zomato API and combine it with the restaurant inspection data to create a new GeoJSON file.

The map will load this file via [D3.js](https://github.com/d3/d3-request/blob/master/README.md).


#### Implementation

* TODO

* TODO
