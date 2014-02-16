library(dplyr)

fetchReport <- function (interval = NA, limit = NA, other = FALSE) {
    command = "curl 'http://localhost:8080/data/?"
    if (!is.na(interval)) { command = paste0(command, "interval=", interval, "&") }
    if (!is.na(limit)) { 
        command = paste0(command, "limit=", limit, "&") 
        if (other) { command = paste0(command, "other&") }
    }
    command = paste0(command, "'")
    temp <- tbl_df(read.csv(pipe(command), header = TRUE))
    # force the timestamp column to POSIXct, which dplyr can work with
    temp$timestamp <- as.POSIXct(strptime(temp$timestamp, "%Y-%m-%d %H:%M:%S"))
    # force all NAs to zero
    temp[is.na(temp)] <- 0
    return(temp)
}

