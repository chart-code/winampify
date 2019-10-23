# Installations

Create a [spotify application](https://developer.spotify.com/dashboard/applications) and save to `bin/credentials.json`. 

```
{
  "clientId" : "abc",
  "clientSecret" : "xyz",
  "redirectUri" : "http://localhost:3989/"
}
```

In the spotify dashboard, you'll need to click Edit Settings" to add `http://localhost:3989/` as a redirectUri.  

`yarn && yarn start` will walk you through the rest of the OAuth process, download a list of all the songs by artists you've liked on spotify and start a server to view your library. 



# links

https://github.com/thelinmichael/spotify-web-api-node

https://developer.spotify.com/dashboard/applications/83cc6f3e727747aab0f30bd4a501308f

https://developer.spotify.com/documentation/general/guides/authorization-guide/

https://developer.spotify.com/documentation/web-api/reference-beta/#category-player

https://developer.spotify.com/documentation/web-playback-sdk/reference/