# covid-rki-trends

## archived

This repository is archived since RKI now makes hospitalization data available in the [official repository](https://github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland).

## description

Script to extract data from the [RKI Trends dashboard](https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Situationsberichte/COVID-19-Trends/COVID-19-Trends.html?__blob=publicationFile#/home).

Note that this repository does not contain DIVI indicators available in the dashboard due to their odd licensing.

![screenshot](https://github.com/FrankGrimm/covid-rki-trends/blob/main/screenshot.png?raw=true)

## running the project

The project requires a working installation of a recent node.js, afterwards you can clone this repository and run:

```bash
npm install # install dependencies (note that this includes a headless browser and is quite large)
./run.sh # invokes all scripts as well as bugfixes for extractions in newer versions of the report
```
