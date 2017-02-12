If you want to search for a document or a set of documents using anything other
than the document identifier, you will have to create a CouchDB view.

In essence, a CouchDB view is a transformation of a database into another database. The transformation is defined by some JavaScript functions that take each document as it gets inserted or updated and maps it into an alternative key and value. CouchDB stores the views in the same way that it stores a normal database, by using a file-based index that differs in just one main thing: it allows you to store more than one document for a given key.

```js
exports.by_to = {  
  map: function(doc) {
    if (doc.to) {
      emit(doc.to, {_id: doc._id});
    }
  }
}
```

This is a CouchDB view: it contains a map function that will run inside CouchDB. This function will be called each time there is an updated or a new message document. It receives the document as the sole argument, and then it uses the `emit` function to write changes to the view. The first argument of the emit function is the index key and the second argument is the value. In this case we're specifying that the key is the to attribute of the message, and that the emitted doc is one document containing only one `_id` field.

We could emit the whole document, but here we're only emitting a document with an `_id` field. This is an optimisation: in this case CouchDB will use the `_id` field to look up and get the referenced document when we're consulting the view.
CouchDB stores the views as special documents. These are called design documents, and they're all prefixed by the `_design/` path. Now we need a module that takes the views' definitions and sends them to CouchDB.



https://blog.yld.io/2016/11/23/node-js-databases-using-couchdb/
http://stackoverflow.com/questions/12403240/storing-null-vs-not-storing-the-key-at-all-in-mongodb?noredirect=1&lq=1
http://docs.couchdb.org/en/2.0.0/api/database/find.html
http://docs.couchdb.org/en/latest/api/server/common.html
http://docs.couchdb.org/en/latest/couchapp/views/intro.html#what-is-a-view
https://www.google.co.uk/search?q=couchdb+vs+mongodb&ie=UTF-8&oe=UTF-8&hl=en-gb&client=safari
https://github.com/flatiron/cradle/
