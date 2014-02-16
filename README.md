twitter-word-trends
===================

# The documentation is not up to date

## Introduction

This compact Node.js server monitors Twitter's stream for a chosen set of keywords and serves the results for custom visualisations, such as the word cloud in the example below (being run at ~ 12pm GMT on Valentine's Day 2014):

    node main.js -search valentinesday -search vday --memory 1 --purge 1 --limit 250

![example screenshot](docs/screenshot1.png)

## Licence

![Creative Commons License](http://i.creativecommons.org/l/by/4.0/88x31.png "Creative Commons License") This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
