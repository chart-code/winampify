The spotify API has strict rate limits and finding all the tracks by liked artists can require thousands of calls. Application rate limits don't increase with more users; to view your own library with this tool you'll to run it yourself. 

# Installation

Create a [spotify application](https://developer.spotify.com/dashboard/applications) and save to `bin/credentials.json`. 

```
{
  "clientId" : "abc",
  "clientSecret" : "xyz",
  "redirectUri" : "http://localhost:3989/public/"
}
```

In the spotify dashboard, you'll need to click "Edit Settings" to add `http://localhost:3989/public/` as a redirectUri.  

`yarn && yarn start` will walk you through the rest of the OAuth process, download a list of all the songs by artists you've liked on spotify and start a server to view your library. 

Auth tokens only last an hour; to avoid having to regularly reload the page to pick up a new Implicit Grant tokens, run `bin/update.sh` and open the page with the provided code parameter. 


# Links

https://github.com/thelinmichael/spotify-web-api-node

https://developer.spotify.com/dashboard/applications/83cc6f3e727747aab0f30bd4a501308f

https://developer.spotify.com/documentation/general/guides/authorization-guide/

https://developer.spotify.com/documentation/web-api/reference-beta/#category-player

https://developer.spotify.com/documentation/web-playback-sdk/reference/

# TODO

- x bach will dl too much
- x add search bar
- blue select

# missing fields
- genre
- x track # (can impute, but does it matter?)
- length