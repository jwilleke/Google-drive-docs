# Google Document Project

## private

Folder holds keys and tokens and should not be shared.

Tokens are stored in private/token.json which needs removed to change user of if Scopes change.

## oauth.js

OAuth allows you to make API calls on behalf of a given user. In this model, the user visits your application, signs in with their Google account, and provides your application with authorization against a set of scopes.

Simple Oauth Test to make sure that the Oauth flow is working, **Does NOT** store tokens.
Uses short lived http server to receive callback.

## googleapis

Google APIs is a client library for using Google APIs. Support for authorization and authentication with OAuth 2.0, API Keys and JWT tokens is included.

- NPM <https://www.npmjs.com/package/googleapis>
- GitHub <https://github.com/googleapis/google-api-nodejs-client>

If you're working with Google Cloud Platform APIs such as Datastore, Cloud Storage or Pub/Sub, consider using the @google-cloud client libraries: single purpose idiomatic Node.js clients for Google Cloud Platform services.

### DOCs

<https://googleapis.dev/nodejs/googleapis/latest/docs/classes/Docs.html>

## MimeTypes

<https://developers.google.com/apps-script/reference/base/mime-type>

```js
DriveApp.getFilesByType(MimeType.GOOGLE_DOCS);
```

## Create

<https://developers.google.com/docs/api/reference/rest/v1/documents/create

## DOCs API References

- Classes <https://googleapis.dev/nodejs/googleapis/latest/docs/classes/Docs.html>
- <https://www.mikesallese.me/blog/google-docs-api-examples/>

Methods
batchUpdate	POST /v1/documents/{documentId}:batchUpdate
Applies one or more updates to the document.
create	POST /v1/documents
Creates a blank document using the title given in the request.
get	GET /v1/documents/{documentId}
Gets the latest version of the specified document.


## APPs

- oauth.js - Simple Oauth Test to make sure that the Oauth flow is working (Does not store token)
- app1.js - Get the specified google document (testDocID) and renders the output and temp.json
