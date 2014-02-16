twitter-word-trends
===================

# The documentation is not up to date

## Introduction

### Server

The role of the server is to query the Twitter streams vs a series of keywords and to offer back CSV reports to any client application requiring them, e.g. the R scripts in [scripts/R](scripts/R) or the example website in [wwwroot](wwwroot).

For example, the command below:

    node server.js -w ../../wwwroot/ -f fracking.json -s fracking -s shale -m 1440

makes the reports available on a web server on the default port of 8080 at *http://localhost:8080/data/* , searching for the "fracking" and "shale" terms, keeping a memory of 1,440 minutes (one day) and reading (if it exists) and saving a cache of the data collected on the *fracking.json* file.

A few parameters can be specified on both the command line and the query string when fetching the report, e.g.:

    node server.js **--interval 5** -w ../../wwwroot/ -f fracking.json -s fracking -s shale -m 1440 

or visiting *http://localhost:8080/data/?interval=5* produce the same effect of issuing a report that consolidates the data being collected every 5 minutes. **The parameters specified on the query string always override the command line**.

The list of parameters that work this way is:

- **interval**: if *interval* is specified, the report is made of one line only for every *interval* minutes interval (at :00, :05, :10 etc. including the lower bound and excluding the upper bound).
- **limit**: if *limit* is specified, the report includes only the top *limit* words being observed during the specified memory interval.
- **other**: when *limit* is specified, the *limit-th word* is replaced by 'other' and its occurrences are the sum of the occurrences of all other words. 


## Licence

![Creative Commons License](http://i.creativecommons.org/l/by/4.0/88x31.png "Creative Commons License") This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
