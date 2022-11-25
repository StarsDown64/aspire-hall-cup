#!/usr/bin/env bash

set -euo pipefail

rofi=(rofi -dmenu -i -scroll-method 1 -font 'Iosevka 15')

exit=0
while [[ "$exit" -eq 0 ]]; do
    BUSSTOP=$(curl --silent "https://bus.gocitybus.com/Home/GetAllBusStops" \
        | jq -r '.[] | "\(.stopCode);\(.stopName)"' \
        | column -t -s ';' \
        | sort \
        | "${rofi[@]}" -p "bus stop" \
        | cut -d ' ' -f 1)

    curl -d "{\"stopCode\":\"$BUSSTOP\"}" \
         -H "Accept-Language: en-US,en" \
         -H "Content-Type: application/json" \
         --silent \
         "https://bus.gocitybus.com/Schedule/GetStopEstimates" \
        | jq -r '.routeStopSchedules[]
                | { routeNumber
                  , routeName
                  , eta: (.stopTimes[]
                        | select(.isRealtime?)
                        | .estimatedDepartTimeUtc
                        | fromdateiso8601
                        | strflocaltime("%m/%d %I:%M%p")) }
                | "\(.eta) \(.routeNumber) \(.routeName)"' \
        | sort \
        | "${rofi[@]}" -p "etas for ${BUSSTOP}"

    exit="$?"
done
