# covid-rki-trends

Script to extract data from the [RKI Trends dashboard](https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Situationsberichte/COVID-19-Trends/COVID-19-Trends.html?__blob=publicationFile#/home).

Note that while this repository contains data in `data.json`, this does not contain DIVI indicators available in the dashboard due to their odd licensing.

![screenshot](![alt text](https://github.com/FrankGrimm/covid-rki-trends/blob/main/screenshot.png?raw=true))

## running the project

The project requires a working installation of a recent node.js, afterwards you can clone this repository and run:

```bash
npm install # install dependencies (note that this includes a headless browser and is quite large)
node index.js # extracts the dashboard data and stores it in data.json
node tocsv.js # exports the extracted time series in data.json into individual CSV files in the data/ directory
```
