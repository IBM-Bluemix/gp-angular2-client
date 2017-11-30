Angular2 for the Globalization Pipeline on IBM's Bluemix
===

<!--
/*  
 * Copyright IBM Corp. 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
-->

#  What is this?
This project provides an SDK for Angular2 developers to dynamically utilize the
[Globalization Pipeline](https://github.com/IBM-Bluemix/gp-common#globalization-pipeline)
Bluemix service.

The SDK provides familiar Angular2 constructs, in the form of a Directive and a Service, that encapsulate usage of the restful API of the Globalization Pipeline to enable globalization of your application.

The basic implementation is inspired from [ngx-translate](https://github.com/ngx-translate/core)

## Installation

#### _Git_ reference:

    npm install "https://github.com/IBM-Bluemix/gp-angular2-client.git" --save-dev

or add the following in `package.json`

    "devDependencies":{
        "ng2-g11n-pipeline": "git+https://github.com/IBM-Bluemix/gp-angular2-client.git"
    }

#### _Manual_ installation (for SDK source code):

    $ git clone git://github.com/IBM-Bluemix/gp-angular-client.git    


# Usage

### Getting started

To get started, you should familiarize yourself with the service itself. A
good place to begin is by reading the [Quick Start Guide](https://github.com/IBM-Bluemix/gp-common#quick-start-guide) and the official [Getting Started with IBM Globalization ](https://www.ng.bluemix.net/docs/services/GlobalizationPipeline/index.html) documentation.

The documentation explains how to find the service on Bluemix, create a new service instance, create a new bundle, and access the translated messages.

### Overview
The designed workflow for using this SDK is as follows. Application bundle data is uploaded onto a Globalization Pipeline instance running on Bluemix and any desired language translations are selected for that bundle. A bundle user of type READER is defined for that service. Once those pieces are configured, data is pulled from Bluemix and used to complete the SDK configuration in the client app. (see Configuration below)

The fields needed to configure this SDK are:

* url
* instanceId
* userId
* password

The url & instanceId fields are taken from the credentials of your service instance of the Globalization Pipeline

Once the GlobalizationPipelineService configuration is complete and you have set your application configuration to those values, you can use the custom `gptranslate` directive or service functions to handle the dynamic globalization needs of your app.

### How to use

#### Basic configuration
In the root app module of your application, add/modify the following snippet in the `imports` array.
```javascript
GpTranslateModule.forRoot({
  "gpCredentialsJson": <credentials path>,
  "defaultBundle": <defaultbundle>,
  "defaultLang": <defaultlang>,
  "uselocal": <uselocal>,
  "localfallbackLang": <localfallbackLang>
})
```
* `<credentials path>` - refers to the location of the json file containing Globalization Pipeline service credentials. A sample credentials file located at `/assets/crendentials.json` will consist of the url, instanceId, userId, and password for the globalization pipeline instance.

* `<defaultbundle>` - refers to the default resource bundle containing translations

* `<defaultlang>` - refers to the default source language in which the application should be translated. If not provided, then the browser default language is used.

* `<uselocal>` - can be **true** or **false**. If `true` then translations are loaded from the local application folder located at `/assets/i18n/`.
For example, if uselocal is set to 'true', and default bundle is `test`, and `english (en)` translations are required, then the translation file is expected to be located at `/assets/i18n/test/en.json`. Currently only 'json' format for translations is supported in the SDK.

* `<localfallbackLang>` - refers to the fallback language to be used when `uselocal` is set to `true` and the translations requested for a language do not exist in the local folder.


#### Translations at component level
The user can specify the bundle/language to be used at component level as follows:
```typescript
public bundle: string = "custombundle"
public lang: string = "en";
constructor(private ts: GpTranslateService) {}
ngOnInit() {
  this.ts.loadtranslations(this.bundle, this.lang);
}
```
As shown above, by adding two public properties `bundle` and `lang` to the component, the component will use the assigned bundle and language for translation purposes. If not specified, then the default languages specified in configuration will be used.

#### Using directives

This SDK provides `gptranslate` directive to support Globalization Pipeline assisted translations. Following snippets show the different usecases
```html
  <!-- key OPEN is translated using bundle/lang specified at Component level else default -->
  <div [gptranslate]="'OPEN'"></div>  

  <!-- key OPEN is translated using bundle/lang specified at Component level else default -->
  <div gptranslate>OPEN</div>

  <!-- key OPEN is translated using bundle/lang specified at Component level else default. The text node ('SAVE') will be ignored -->
  <div gptranslate="OPEN">SAVE</div>

  <!-- key OPEN is translated using bundle/lang specified at Component level else default. The text node with whitespaces/newlines are ignored-->
  <div gptranslate="OPEN">
  </div>

  <!-- key OPEN is translated using 'es' lang and bundle specified at Component level else default -->
  <div [gptranslate] lang="es">OPEN</div>

  <!-- key OPEN is translated using 'en' lang and bundle 'diffbundle' -->
  <div [gptranslate] lang="en" bundle="diffbundle">OPEN</div>

  <!-- key TEMPLATE is translated using bundle/lang specified at Component level else default. if the translated value for the key
contains text like '{basic}', then the '{basic}' is replaced with 'basic param' in the translated text  -->
  <div gptranslate="TEMPLATE" [formatparams]="{basic:'basic param'}"></div>

  <!-- key TEMPLATE is translated using bundle/lang specified at Component level else default. if the translated value for the key
contains text like '{advanced}', then the '{advanced}' is replaced with '{param}' in the translated text. The key 'param' is then  
translated using bundle/lang specified at Component level else default. Finally '{param}' is replaced with translated value of 'param'-->
  <div gptranslate="TEMPLATE" [formatparams]="{advanced:'{param}'}"></div>
```

#### Using pipes

This SDK also provides translation support using pipe. The following code snippet describes the usecases.

```html
    <!-- key EDIT is translated using default language and default bundle-->
    <div>{{"EDIT" | gptranslate}}</div>

    <!-- key EDIT is translated using 'bundle1' bundle and default language-->
    <div>{{"EDIT" | gptranslate:'bundle1'}}</div>

    <!-- key EDIT is translated using 'bundle1' bundle and 'es' language -->
    <div>{{"EDIT" | gptranslate:'bundle1':'es'}}</div>

    <!-- key EDIT is translated using 'bundle1' bundle and 'es' language and interpolated params-->
    <div>{{"EDIT" | gptranslate:'bundle1':'es':'{"param1":"value1", "param2":"value2"}'}}</div>
```

#### Language change event support

The SDK also provides the translation directives and pipes to subscribe to language change events. Using `changeLanguage(lang)`
api of `GpTranslateService` all the translations executed with default language for directives and pipes will change based on the language specified in the `changeLanguage` function parameter.

# Scripts

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Testing

Before running the tests make sure you have valid Globalization Pipeline instance credentials specified in  `assets/credentials.json`.
The credentials provided should be of a Reader to support basic auth.

On the instance upload the bundles kept in `assets/i18n` folder. Only the "en.json" files need to be uploaded to the globalization pipeline instance.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Then run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

Community
---------
* View or file GitHub [Issues](https://github.com/IBM-Bluemix/gp-angular2-client/issues)

Contributing
------------
See [CONTRIBUTING.md](CONTRIBUTING.md).

License
-------
Apache 2.0. See [LICENSE.txt](LICENSE.txt).

> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.
