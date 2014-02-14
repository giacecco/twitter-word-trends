twitter-word-trends
===================

## Introduction

This compact Node.js server monitors Twitter's stream for a chosen set of keywords and serves the results for custom visualisations, such as the word cloud in the example below (being run at ~ 12pm GMT on Valentine's Day 2014):

    node main.js -search valentinesday -search vday --memory 1 --purge 1 --limit 100

![example screenshot](docs/screenshot1.png)

## Licence

### Example website

The example website in the [wwwroot](wwwroot/) folder is derived from Jason Davies' [Word Cloud Generator](http://www.jasondavies.com/wordcloud/), that is copyright (c) 2013, Jason Davies. All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

  * The name Jason Davies may not be used to endorse or promote products derived from this software without specific prior written permission.

### All other source and binaries

Copyright (c) 2014 Gianfranco Cecconi.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.