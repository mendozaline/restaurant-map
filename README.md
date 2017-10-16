## Washington County, Oregon Restaurant Map

DEMO: [https://mendozaline.github.io/restaurant-map/](https://mendozaline.github.io/restaurant-map/)

### Map Proposal
Most people don't like to get food poisoning when they go out to eat. However, they probably aren't sure how to differentiate between sanitary and dirty restaurants besides using superficial criteria. A more rigorous way to address this problem is by making health inspection scores more easily available to people in an interactive map. So before they go to a restaurant, they can quickly look up its score and decide if it's safe to eat there.

Additionally, I want to determine which types of establishments do the best as a cuisine group and within each group. For instance, helping people determine who has the best restaurant inspection score among Italian restaurants (probably not Olive Garden) or vegan places. I want to show this graphically in a scatter plot to make comparison easier.

I will be using data from [Washington County's Health and Human Services deperatment](http://www.co.washington.or.us/HHS/EnvironmentalHealth/FoodSafety/restaurant-inspections.cfm) that I will scape from their website. I will also be using data from the [Yelp API](https://www.yelp.com/developers/documentation/v3). My goal is to combine data from both to make a new GeoJSON file that I can display, but only includes the data I need from either source. 

### Data Pipeline Proposal
I will start by scraping restaurant score data from [Washington County's Restaurant Inspections](http://www.co.washington.or.us/HHS/EnvironmentalHealth/FoodSafety/restaurant-inspections.cfm) site. I am doing this by writing a module and then copying and pasting it into the console of the site. This will create a list of elements from the search results, which will then be parsed and saved as a JSON file. I will do this for each city.

I then will take each of these JSON files and match it against [Yelp's business search API](https://www.yelp.com/developers/documentation/v3/business_search). This API has restaurant data such as customer ratings, types of cuisine served, price range, and most importantly latitude and longitude location data. Rather than geocode the addresses directly from the restaurant inspection site, I'm going to search for each restaurant with the Yelp API and combine it with the restaurant inspection data to create a new GeoJSON file.

The map will load this file via [D3.js](https://github.com/d3/d3-request/blob/master/README.md), but be displayed using [react-leaflet](https://github.com/PaulLeCam/react-leaflet)
