# TODO

* Transform the code to be a valid angular module
* Depends on "angularjs-geolocation" ensure to make it works correctly when someone install our module
* Remove *Settings* dependency -> use options instead
* Add unit tests (Test options and call to logAction in different context with geolocation and without geolocation)
* Add documentation
* Add a complete example
* Add procedure to deploy the library in the bower registry (Mostly for us)

# Testing Endpoints

http://services.fidemapps.com


# Call Example

```js
FidemServices.logAction({
    type: 'viewShow',
    data: {
        id: 'show1',
        name: 'The Big Show'
    }
});
```


# Note pour bower

bower register angular-fidem git://github.com/fidem/angular-fidem.git

TAG pour les versions
le nom du tag tu mets soit 1.0.0, soit v1.0.0

Ajouter les js min avant de faire le tag

Pas de modifications possibles, faire attention!

Pas trop valider pas comme npm

