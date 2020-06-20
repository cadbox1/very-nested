# README

## Setting Up

Install Netlify dev
`npm install -g netlify-cli@2.52.0`

Login with Netlify
`netlify login`

Link with Netlify
`netlify link`

## Running Locally

`Yarn start`

Grab the localstorage entry from the production app to authenticate. A lot easier than running the backend.

## Running the Backend

`netlify dev`

Add the following to the `netlify.toml`.

```
base = "./"
```

Change the redirect_uri in github oauth app.
