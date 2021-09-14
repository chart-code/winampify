[roadtolarissa.com/winampify/](https://roadtolarissa.com/winampify/)

Winamp style interface for Spotify. All track

The Spotify API has strict rate limits and finding all the tracks by liked artists can require thousands of calls. Application rate limits don't increase with more users; to view your own library with this tool you'll to have run it yourself. 

# Installation

Create a [Spotify application](https://developer.spotify.com/dashboard/applications) and save to `bin/credentials.json`. 

```
{
  "clientId" : "abc",
  "clientSecret" : "xyz",
  "redirectUri" : "http://localhost:3989/public/"
}
```

In the spotify dashboard, you'll also need to click "Edit Settings" and add `http://localhost:3989/public/` as a redirectUri.  

`yarn && yarn start` will walk you through the rest of the OAuth process, start server with a longer lasting auth token and download a list of all the songs by artists you've liked on Spotify. 