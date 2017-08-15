### 1. Map Proposal

**Draft Due Monday August 7th**

* Problem Statement - What is the problem you are attempting to address with your map?

* What story to tell - What story will you tell with your map and data to highlight unique angle of your problem?

* Data needs - What data will you use? how will you access the data? does it need to be cleaned/processed before putting on a map?

I'll give feedback on the draft and we can iterate based on the draft. Please have it in on Monday to give us enough time!


#### My Map Proposal

Most people don't like to get food poisoning when they go out to eat. However, they probably aren't sure how to differentiate between sanitary and dirty restaurants besides using superficial criteria. A more rigorous way to address this problem is by making health inspection scores more easily available to people in a searchable, interactive map. So before they go to a restaurant, they can quickly look up its score and decide if it's safe.

Besides looking up the inspection score for the restaurant they are already planning to go to, this map will also reveal which restaurants are the highest scoring overall. So people can search for new restaurants around them, but choose the most sanitary ones. They can also see the rankings of  establishments by types of cuisine (i.e., fast food, Thai, bars, cafes, etc.)

Additionally, I want to determine which types of establishments do the best as a group and within each group. So determining who has the best restaurant inspection score among Italian restaurants? (Probably not Olive Garden.)

Finally, I want to show graphically in a line chart how restaurants do over time. Do their inspection scores decline or rise since they opened? Is there any pattern that emerges? 

I will be using data from [Washington County's Health and Human Services deperatment](http://www.co.washington.or.us/HHS/EnvironmentalHealth/FoodSafety/restaurant-inspections.cfm). I will also be using the [Zomato API](https://developers.zomato.com/), which has more information about restaurants. My goal is to combine data from both to make a new GeoJSON that I can map, but only includes the data I need for either source. 

-----------------------------------------------------------------------

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
