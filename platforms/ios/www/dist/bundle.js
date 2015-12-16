(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license AngularJS v1.4.7
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

/* jshint ignore:start */
// this code is in the core, but not in angular-messages.js
var isArray = angular.isArray;
var forEach = angular.forEach;
var isString = angular.isString;
var jqLite = angular.element;
/* jshint ignore:end */

/**
 * @ngdoc module
 * @name ngMessages
 * @description
 *
 * The `ngMessages` module provides enhanced support for displaying messages within templates
 * (typically within forms or when rendering message objects that return key/value data).
 * Instead of relying on JavaScript code and/or complex ng-if statements within your form template to
 * show and hide error messages specific to the state of an input field, the `ngMessages` and
 * `ngMessage` directives are designed to handle the complexity, inheritance and priority
 * sequencing based on the order of how the messages are defined in the template.
 *
 * Currently, the ngMessages module only contains the code for the `ngMessages`, `ngMessagesInclude`
 * `ngMessage` and `ngMessageExp` directives.
 *
 * # Usage
 * The `ngMessages` directive listens on a key/value collection which is set on the ngMessages attribute.
 * Since the {@link ngModel ngModel} directive exposes an `$error` object, this error object can be
 * used with `ngMessages` to display control error messages in an easier way than with just regular angular
 * template directives.
 *
 * ```html
 * <form name="myForm">
 *   <label>
 *     Enter text:
 *     <input type="text" ng-model="field" name="myField" required minlength="5" />
 *   </label>
 *   <div ng-messages="myForm.myField.$error" role="alert">
 *     <div ng-message="required">You did not enter a field</div>
 *     <div ng-message="minlength, maxlength">
 *       Your email must be between 5 and 100 characters long
 *     </div>
 *   </div>
 * </form>
 * ```
 *
 * Now whatever key/value entries are present within the provided object (in this case `$error`) then
 * the ngMessages directive will render the inner first ngMessage directive (depending if the key values
 * match the attribute value present on each ngMessage directive). In other words, if your errors
 * object contains the following data:
 *
 * ```javascript
 * <!-- keep in mind that ngModel automatically sets these error flags -->
 * myField.$error = { minlength : true, required : true };
 * ```
 *
 * Then the `required` message will be displayed first. When required is false then the `minlength` message
 * will be displayed right after (since these messages are ordered this way in the template HTML code).
 * The prioritization of each message is determined by what order they're present in the DOM.
 * Therefore, instead of having custom JavaScript code determine the priority of what errors are
 * present before others, the presentation of the errors are handled within the template.
 *
 * By default, ngMessages will only display one error at a time. However, if you wish to display all
 * messages then the `ng-messages-multiple` attribute flag can be used on the element containing the
 * ngMessages directive to make this happen.
 *
 * ```html
 * <!-- attribute-style usage -->
 * <div ng-messages="myForm.myField.$error" ng-messages-multiple>...</div>
 *
 * <!-- element-style usage -->
 * <ng-messages for="myForm.myField.$error" multiple>...</ng-messages>
 * ```
 *
 * ## Reusing and Overriding Messages
 * In addition to prioritization, ngMessages also allows for including messages from a remote or an inline
 * template. This allows for generic collection of messages to be reused across multiple parts of an
 * application.
 *
 * ```html
 * <script type="text/ng-template" id="error-messages">
 *   <div ng-message="required">This field is required</div>
 *   <div ng-message="minlength">This field is too short</div>
 * </script>
 *
 * <div ng-messages="myForm.myField.$error" role="alert">
 *   <div ng-messages-include="error-messages"></div>
 * </div>
 * ```
 *
 * However, including generic messages may not be useful enough to match all input fields, therefore,
 * `ngMessages` provides the ability to override messages defined in the remote template by redefining
 * them within the directive container.
 *
 * ```html
 * <!-- a generic template of error messages known as "my-custom-messages" -->
 * <script type="text/ng-template" id="my-custom-messages">
 *   <div ng-message="required">This field is required</div>
 *   <div ng-message="minlength">This field is too short</div>
 * </script>
 *
 * <form name="myForm">
 *   <label>
 *     Email address
 *     <input type="email"
 *            id="email"
 *            name="myEmail"
 *            ng-model="email"
 *            minlength="5"
 *            required />
 *   </label>
 *   <!-- any ng-message elements that appear BEFORE the ng-messages-include will
 *        override the messages present in the ng-messages-include template -->
 *   <div ng-messages="myForm.myEmail.$error" role="alert">
 *     <!-- this required message has overridden the template message -->
 *     <div ng-message="required">You did not enter your email address</div>
 *
 *     <!-- this is a brand new message and will appear last in the prioritization -->
 *     <div ng-message="email">Your email address is invalid</div>
 *
 *     <!-- and here are the generic error messages -->
 *     <div ng-messages-include="my-custom-messages"></div>
 *   </div>
 * </form>
 * ```
 *
 * In the example HTML code above the message that is set on required will override the corresponding
 * required message defined within the remote template. Therefore, with particular input fields (such
 * email addresses, date fields, autocomplete inputs, etc...), specialized error messages can be applied
 * while more generic messages can be used to handle other, more general input errors.
 *
 * ## Dynamic Messaging
 * ngMessages also supports using expressions to dynamically change key values. Using arrays and
 * repeaters to list messages is also supported. This means that the code below will be able to
 * fully adapt itself and display the appropriate message when any of the expression data changes:
 *
 * ```html
 * <form name="myForm">
 *   <label>
 *     Email address
 *     <input type="email"
 *            name="myEmail"
 *            ng-model="email"
 *            minlength="5"
 *            required />
 *   </label>
 *   <div ng-messages="myForm.myEmail.$error" role="alert">
 *     <div ng-message="required">You did not enter your email address</div>
 *     <div ng-repeat="errorMessage in errorMessages">
 *       <!-- use ng-message-exp for a message whose key is given by an expression -->
 *       <div ng-message-exp="errorMessage.type">{{ errorMessage.text }}</div>
 *     </div>
 *   </div>
 * </form>
 * ```
 *
 * The `errorMessage.type` expression can be a string value or it can be an array so
 * that multiple errors can be associated with a single error message:
 *
 * ```html
 *   <label>
 *     Email address
 *     <input type="email"
 *            ng-model="data.email"
 *            name="myEmail"
 *            ng-minlength="5"
 *            ng-maxlength="100"
 *            required />
 *   </label>
 *   <div ng-messages="myForm.myEmail.$error" role="alert">
 *     <div ng-message-exp="'required'">You did not enter your email address</div>
 *     <div ng-message-exp="['minlength', 'maxlength']">
 *       Your email must be between 5 and 100 characters long
 *     </div>
 *   </div>
 * ```
 *
 * Feel free to use other structural directives such as ng-if and ng-switch to further control
 * what messages are active and when. Be careful, if you place ng-message on the same element
 * as these structural directives, Angular may not be able to determine if a message is active
 * or not. Therefore it is best to place the ng-message on a child element of the structural
 * directive.
 *
 * ```html
 * <div ng-messages="myForm.myEmail.$error" role="alert">
 *   <div ng-if="showRequiredError">
 *     <div ng-message="required">Please enter something</div>
 *   </div>
 * </div>
 * ```
 *
 * ## Animations
 * If the `ngAnimate` module is active within the application then the `ngMessages`, `ngMessage` and
 * `ngMessageExp` directives will trigger animations whenever any messages are added and removed from
 * the DOM by the `ngMessages` directive.
 *
 * Whenever the `ngMessages` directive contains one or more visible messages then the `.ng-active` CSS
 * class will be added to the element. The `.ng-inactive` CSS class will be applied when there are no
 * messages present. Therefore, CSS transitions and keyframes as well as JavaScript animations can
 * hook into the animations whenever these classes are added/removed.
 *
 * Let's say that our HTML code for our messages container looks like so:
 *
 * ```html
 * <div ng-messages="myMessages" class="my-messages" role="alert">
 *   <div ng-message="alert" class="some-message">...</div>
 *   <div ng-message="fail" class="some-message">...</div>
 * </div>
 * ```
 *
 * Then the CSS animation code for the message container looks like so:
 *
 * ```css
 * .my-messages {
 *   transition:1s linear all;
 * }
 * .my-messages.ng-active {
 *   // messages are visible
 * }
 * .my-messages.ng-inactive {
 *   // messages are hidden
 * }
 * ```
 *
 * Whenever an inner message is attached (becomes visible) or removed (becomes hidden) then the enter
 * and leave animation is triggered for each particular element bound to the `ngMessage` directive.
 *
 * Therefore, the CSS code for the inner messages looks like so:
 *
 * ```css
 * .some-message {
 *   transition:1s linear all;
 * }
 *
 * .some-message.ng-enter {}
 * .some-message.ng-enter.ng-enter-active {}
 *
 * .some-message.ng-leave {}
 * .some-message.ng-leave.ng-leave-active {}
 * ```
 *
 * {@link ngAnimate Click here} to learn how to use JavaScript animations or to learn more about ngAnimate.
 */
angular.module('ngMessages', [])

   /**
    * @ngdoc directive
    * @module ngMessages
    * @name ngMessages
    * @restrict AE
    *
    * @description
    * `ngMessages` is a directive that is designed to show and hide messages based on the state
    * of a key/value object that it listens on. The directive itself complements error message
    * reporting with the `ngModel` $error object (which stores a key/value state of validation errors).
    *
    * `ngMessages` manages the state of internal messages within its container element. The internal
    * messages use the `ngMessage` directive and will be inserted/removed from the page depending
    * on if they're present within the key/value object. By default, only one message will be displayed
    * at a time and this depends on the prioritization of the messages within the template. (This can
    * be changed by using the `ng-messages-multiple` or `multiple` attribute on the directive container.)
    *
    * A remote template can also be used to promote message reusability and messages can also be
    * overridden.
    *
    * {@link module:ngMessages Click here} to learn more about `ngMessages` and `ngMessage`.
    *
    * @usage
    * ```html
    * <!-- using attribute directives -->
    * <ANY ng-messages="expression" role="alert">
    *   <ANY ng-message="stringValue">...</ANY>
    *   <ANY ng-message="stringValue1, stringValue2, ...">...</ANY>
    *   <ANY ng-message-exp="expressionValue">...</ANY>
    * </ANY>
    *
    * <!-- or by using element directives -->
    * <ng-messages for="expression" role="alert">
    *   <ng-message when="stringValue">...</ng-message>
    *   <ng-message when="stringValue1, stringValue2, ...">...</ng-message>
    *   <ng-message when-exp="expressionValue">...</ng-message>
    * </ng-messages>
    * ```
    *
    * @param {string} ngMessages an angular expression evaluating to a key/value object
    *                 (this is typically the $error object on an ngModel instance).
    * @param {string=} ngMessagesMultiple|multiple when set, all messages will be displayed with true
    *
    * @example
    * <example name="ngMessages-directive" module="ngMessagesExample"
    *          deps="angular-messages.js"
    *          animations="true" fixBase="true">
    *   <file name="index.html">
    *     <form name="myForm">
    *       <label>
    *         Enter your name:
    *         <input type="text"
    *                name="myName"
    *                ng-model="name"
    *                ng-minlength="5"
    *                ng-maxlength="20"
    *                required />
    *       </label>
    *       <pre>myForm.myName.$error = {{ myForm.myName.$error | json }}</pre>
    *
    *       <div ng-messages="myForm.myName.$error" style="color:maroon" role="alert">
    *         <div ng-message="required">You did not enter a field</div>
    *         <div ng-message="minlength">Your field is too short</div>
    *         <div ng-message="maxlength">Your field is too long</div>
    *       </div>
    *     </form>
    *   </file>
    *   <file name="script.js">
    *     angular.module('ngMessagesExample', ['ngMessages']);
    *   </file>
    * </example>
    */
   .directive('ngMessages', ['$animate', function($animate) {
     var ACTIVE_CLASS = 'ng-active';
     var INACTIVE_CLASS = 'ng-inactive';

     return {
       require: 'ngMessages',
       restrict: 'AE',
       controller: ['$element', '$scope', '$attrs', function($element, $scope, $attrs) {
         var ctrl = this;
         var latestKey = 0;
         var nextAttachId = 0;

         this.getAttachId = function getAttachId() { return nextAttachId++; };

         var messages = this.messages = {};
         var renderLater, cachedCollection;

         this.render = function(collection) {
           collection = collection || {};

           renderLater = false;
           cachedCollection = collection;

           // this is true if the attribute is empty or if the attribute value is truthy
           var multiple = isAttrTruthy($scope, $attrs.ngMessagesMultiple) ||
                          isAttrTruthy($scope, $attrs.multiple);

           var unmatchedMessages = [];
           var matchedKeys = {};
           var messageItem = ctrl.head;
           var messageFound = false;
           var totalMessages = 0;

           // we use != instead of !== to allow for both undefined and null values
           while (messageItem != null) {
             totalMessages++;
             var messageCtrl = messageItem.message;

             var messageUsed = false;
             if (!messageFound) {
               forEach(collection, function(value, key) {
                 if (!messageUsed && truthy(value) && messageCtrl.test(key)) {
                   // this is to prevent the same error name from showing up twice
                   if (matchedKeys[key]) return;
                   matchedKeys[key] = true;

                   messageUsed = true;
                   messageCtrl.attach();
                 }
               });
             }

             if (messageUsed) {
               // unless we want to display multiple messages then we should
               // set a flag here to avoid displaying the next message in the list
               messageFound = !multiple;
             } else {
               unmatchedMessages.push(messageCtrl);
             }

             messageItem = messageItem.next;
           }

           forEach(unmatchedMessages, function(messageCtrl) {
             messageCtrl.detach();
           });

           unmatchedMessages.length !== totalMessages
              ? $animate.setClass($element, ACTIVE_CLASS, INACTIVE_CLASS)
              : $animate.setClass($element, INACTIVE_CLASS, ACTIVE_CLASS);
         };

         $scope.$watchCollection($attrs.ngMessages || $attrs['for'], ctrl.render);

         this.reRender = function() {
           if (!renderLater) {
             renderLater = true;
             $scope.$evalAsync(function() {
               if (renderLater) {
                 cachedCollection && ctrl.render(cachedCollection);
               }
             });
           }
         };

         this.register = function(comment, messageCtrl) {
           var nextKey = latestKey.toString();
           messages[nextKey] = {
             message: messageCtrl
           };
           insertMessageNode($element[0], comment, nextKey);
           comment.$$ngMessageNode = nextKey;
           latestKey++;

           ctrl.reRender();
         };

         this.deregister = function(comment) {
           var key = comment.$$ngMessageNode;
           delete comment.$$ngMessageNode;
           removeMessageNode($element[0], comment, key);
           delete messages[key];
           ctrl.reRender();
         };

         function findPreviousMessage(parent, comment) {
           var prevNode = comment;
           var parentLookup = [];
           while (prevNode && prevNode !== parent) {
             var prevKey = prevNode.$$ngMessageNode;
             if (prevKey && prevKey.length) {
               return messages[prevKey];
             }

             // dive deeper into the DOM and examine its children for any ngMessage
             // comments that may be in an element that appears deeper in the list
             if (prevNode.childNodes.length && parentLookup.indexOf(prevNode) == -1) {
               parentLookup.push(prevNode);
               prevNode = prevNode.childNodes[prevNode.childNodes.length - 1];
             } else {
               prevNode = prevNode.previousSibling || prevNode.parentNode;
             }
           }
         }

         function insertMessageNode(parent, comment, key) {
           var messageNode = messages[key];
           if (!ctrl.head) {
             ctrl.head = messageNode;
           } else {
             var match = findPreviousMessage(parent, comment);
             if (match) {
               messageNode.next = match.next;
               match.next = messageNode;
             } else {
               messageNode.next = ctrl.head;
               ctrl.head = messageNode;
             }
           }
         }

         function removeMessageNode(parent, comment, key) {
           var messageNode = messages[key];

           var match = findPreviousMessage(parent, comment);
           if (match) {
             match.next = messageNode.next;
           } else {
             ctrl.head = messageNode.next;
           }
         }
       }]
     };

     function isAttrTruthy(scope, attr) {
      return (isString(attr) && attr.length === 0) || //empty attribute
             truthy(scope.$eval(attr));
     }

     function truthy(val) {
       return isString(val) ? val.length : !!val;
     }
   }])

   /**
    * @ngdoc directive
    * @name ngMessagesInclude
    * @restrict AE
    * @scope
    *
    * @description
    * `ngMessagesInclude` is a directive with the purpose to import existing ngMessage template
    * code from a remote template and place the downloaded template code into the exact spot
    * that the ngMessagesInclude directive is placed within the ngMessages container. This allows
    * for a series of pre-defined messages to be reused and also allows for the developer to
    * determine what messages are overridden due to the placement of the ngMessagesInclude directive.
    *
    * @usage
    * ```html
    * <!-- using attribute directives -->
    * <ANY ng-messages="expression" role="alert">
    *   <ANY ng-messages-include="remoteTplString">...</ANY>
    * </ANY>
    *
    * <!-- or by using element directives -->
    * <ng-messages for="expression" role="alert">
    *   <ng-messages-include src="expressionValue1">...</ng-messages-include>
    * </ng-messages>
    * ```
    *
    * {@link module:ngMessages Click here} to learn more about `ngMessages` and `ngMessage`.
    *
    * @param {string} ngMessagesInclude|src a string value corresponding to the remote template.
    */
   .directive('ngMessagesInclude',
     ['$templateRequest', '$document', '$compile', function($templateRequest, $document, $compile) {

     return {
       restrict: 'AE',
       require: '^^ngMessages', // we only require this for validation sake
       link: function($scope, element, attrs) {
         var src = attrs.ngMessagesInclude || attrs.src;
         $templateRequest(src).then(function(html) {
           $compile(html)($scope, function(contents) {
             element.after(contents);

             // the anchor is placed for debugging purposes
             var anchor = jqLite($document[0].createComment(' ngMessagesInclude: ' + src + ' '));
             element.after(anchor);

             // we don't want to pollute the DOM anymore by keeping an empty directive element
             element.remove();
           });
         });
       }
     };
   }])

   /**
    * @ngdoc directive
    * @name ngMessage
    * @restrict AE
    * @scope
    *
    * @description
    * `ngMessage` is a directive with the purpose to show and hide a particular message.
    * For `ngMessage` to operate, a parent `ngMessages` directive on a parent DOM element
    * must be situated since it determines which messages are visible based on the state
    * of the provided key/value map that `ngMessages` listens on.
    *
    * More information about using `ngMessage` can be found in the
    * {@link module:ngMessages `ngMessages` module documentation}.
    *
    * @usage
    * ```html
    * <!-- using attribute directives -->
    * <ANY ng-messages="expression" role="alert">
    *   <ANY ng-message="stringValue">...</ANY>
    *   <ANY ng-message="stringValue1, stringValue2, ...">...</ANY>
    * </ANY>
    *
    * <!-- or by using element directives -->
    * <ng-messages for="expression" role="alert">
    *   <ng-message when="stringValue">...</ng-message>
    *   <ng-message when="stringValue1, stringValue2, ...">...</ng-message>
    * </ng-messages>
    * ```
    *
    * @param {expression} ngMessage|when a string value corresponding to the message key.
    */
  .directive('ngMessage', ngMessageDirectiveFactory('AE'))


   /**
    * @ngdoc directive
    * @name ngMessageExp
    * @restrict AE
    * @scope
    *
    * @description
    * `ngMessageExp` is a directive with the purpose to show and hide a particular message.
    * For `ngMessageExp` to operate, a parent `ngMessages` directive on a parent DOM element
    * must be situated since it determines which messages are visible based on the state
    * of the provided key/value map that `ngMessages` listens on.
    *
    * @usage
    * ```html
    * <!-- using attribute directives -->
    * <ANY ng-messages="expression">
    *   <ANY ng-message-exp="expressionValue">...</ANY>
    * </ANY>
    *
    * <!-- or by using element directives -->
    * <ng-messages for="expression">
    *   <ng-message when-exp="expressionValue">...</ng-message>
    * </ng-messages>
    * ```
    *
    * {@link module:ngMessages Click here} to learn more about `ngMessages` and `ngMessage`.
    *
    * @param {expression} ngMessageExp|whenExp an expression value corresponding to the message key.
    */
  .directive('ngMessageExp', ngMessageDirectiveFactory('A'));

function ngMessageDirectiveFactory(restrict) {
  return ['$animate', function($animate) {
    return {
      restrict: 'AE',
      transclude: 'element',
      terminal: true,
      require: '^^ngMessages',
      link: function(scope, element, attrs, ngMessagesCtrl, $transclude) {
        var commentNode = element[0];

        var records;
        var staticExp = attrs.ngMessage || attrs.when;
        var dynamicExp = attrs.ngMessageExp || attrs.whenExp;
        var assignRecords = function(items) {
          records = items
              ? (isArray(items)
                    ? items
                    : items.split(/[\s,]+/))
              : null;
          ngMessagesCtrl.reRender();
        };

        if (dynamicExp) {
          assignRecords(scope.$eval(dynamicExp));
          scope.$watchCollection(dynamicExp, assignRecords);
        } else {
          assignRecords(staticExp);
        }

        var currentElement, messageCtrl;
        ngMessagesCtrl.register(commentNode, messageCtrl = {
          test: function(name) {
            return contains(records, name);
          },
          attach: function() {
            if (!currentElement) {
              $transclude(scope, function(elm) {
                $animate.enter(elm, null, element);
                currentElement = elm;

                // Each time we attach this node to a message we get a new id that we can match
                // when we are destroying the node later.
                var $$attachId = currentElement.$$attachId = ngMessagesCtrl.getAttachId();

                // in the event that the parent element is destroyed
                // by any other structural directive then it's time
                // to deregister the message from the controller
                currentElement.on('$destroy', function() {
                  if (currentElement && currentElement.$$attachId === $$attachId) {
                    ngMessagesCtrl.deregister(commentNode);
                    messageCtrl.detach();
                  }
                });
              });
            }
          },
          detach: function() {
            if (currentElement) {
              var elm = currentElement;
              currentElement = null;
              $animate.leave(elm);
            }
          }
        });
      }
    };
  }];

  function contains(collection, key) {
    if (collection) {
      return isArray(collection)
          ? collection.indexOf(key) >= 0
          : collection.hasOwnProperty(key);
    }
  }
}


})(window, window.angular);

},{}],2:[function(require,module,exports){
require('./angular-messages');
module.exports = 'ngMessages';

},{"./angular-messages":1}],3:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/*
 * ion-autocomplete 0.3.0
 * Copyright 2015 Danny Povolotski
 * Copyright modifications 2015 Guy Brand
 * https://github.com/guylabs/ion-autocomplete
 */
(function() {

'use strict';

angular.module('ion-autocomplete', []).directive('ionAutocomplete', [
    '$ionicBackdrop', '$ionicScrollDelegate', '$document', '$q', '$parse', '$interpolate', '$ionicPlatform', '$compile', '$templateRequest',
    function ($ionicBackdrop, $ionicScrollDelegate, $document, $q, $parse, $interpolate, $ionicPlatform, $compile, $templateRequest) {
        return {
            require: ['ngModel', 'ionAutocomplete'],
            restrict: 'A',
            scope: {},
            bindToController: {
                ngModel: '=',
                externalModel: '=',
                templateData: '=',
                itemsMethod: '&',
                itemsClickedMethod: '&',
                itemsRemovedMethod: '&',
                modelToItemMethod: '&',
                cancelButtonClickedMethod: '&',
                placeholder: '@',
                cancelLabel: '@',
                selectItemsLabel: '@',
                selectedItemsLabel: '@'
            },
            controllerAs: 'viewModel',
            controller: ['$attrs', '$timeout', '$scope', function ($attrs, $timeout, $scope) {

                var valueOrDefault = function (value, defaultValue) {
                    return !value ? defaultValue : value;
                };

                var controller = this;

                // set the default values of the one way binded attributes
                $timeout(function () {
                    controller.placeholder = valueOrDefault(controller.placeholder, 'Click to enter a value...');
                    controller.cancelLabel = valueOrDefault(controller.cancelLabel, 'Done');
                    controller.selectItemsLabel = valueOrDefault(controller.selectItemsLabel, "Select an item...");
                    controller.selectedItemsLabel = valueOrDefault(controller.selectedItemsLabel, $interpolate("Selected items{{maxSelectedItems ? ' (max. ' + maxSelectedItems + ')' : ''}}:")(controller));
                });

                // set the default values of the passed in attributes
                this.maxSelectedItems = valueOrDefault($attrs.maxSelectedItems, undefined);
                this.templateUrl = valueOrDefault($attrs.templateUrl, undefined);
                this.itemsMethodValueKey = valueOrDefault($attrs.itemsMethodValueKey, undefined);
                this.itemValueKey = valueOrDefault($attrs.itemValueKey, undefined);
                this.itemViewValueKey = valueOrDefault($attrs.itemViewValueKey, undefined);
                this.componentId = valueOrDefault($attrs.componentId, undefined);
                this.loadingIcon = valueOrDefault($attrs.loadingIcon, undefined);
                this.manageExternally = valueOrDefault($attrs.manageExternally, "false");
                this.ngModelOptions = valueOrDefault($scope.$eval($attrs.ngModelOptions), {});

                // loading flag if the items-method is a function
                this.showLoadingIcon = false;

                // the items, selected items and the query for the list
                this.searchItems = [];
                this.selectedItems = [];
                this.searchQuery = undefined;
            }],
            link: function (scope, element, attrs, controllers) {

                // get the two needed controllers
                var ngModelController = controllers[0];
                var ionAutocompleteController = controllers[1];

                // use a random css class to bind the modal to the component
                ionAutocompleteController.randomCssClass = "ion-autocomplete-random-" + Math.floor((Math.random() * 1000) + 1);

                var template = [
                    '<div class="ion-autocomplete-container ' + ionAutocompleteController.randomCssClass + ' modal" style="display: none;">',
                    '<div class="bar bar-header item-input-inset">',
                    '<label class="item-input-wrapper">',
                    '<i class="icon ion-search placeholder-icon"></i>',
                    '<input type="search" class="ion-autocomplete-search" ng-model="viewModel.searchQuery" ng-model-options="viewModel.ngModelOptions" placeholder="{{viewModel.placeholder}}"/>',
                    '</label>',
                    '<div class="ion-autocomplete-loading-icon" ng-if="viewModel.showLoadingIcon && viewModel.loadingIcon"><ion-spinner icon="{{viewModel.loadingIcon}}"></ion-spinner></div>',
                    '<button class="ion-autocomplete-cancel button button-clear" ng-click="viewModel.cancelClick()">{{viewModel.cancelLabel}}</button>',
                    '</div>',
                    '<ion-content class="has-header">',
                    '<ion-item class="item-divider" ng-show="viewModel.selectedItems.length > 0">{{viewModel.selectedItemsLabel}}</ion-item>',
                    '<ion-item ng-repeat="selectedItem in viewModel.selectedItems track by $index" class="item-icon-left item-icon-right item-text-wrap">',
                    '<i class="icon ion-checkmark"></i>',
                    '{{viewModel.getItemValue(selectedItem, viewModel.itemViewValueKey)}}',
                    '<i class="icon ion-trash-a" style="cursor:pointer" ng-click="viewModel.removeItem($index)"></i>',
                    '</ion-item>',
                    '<ion-item class="item-divider" ng-show="viewModel.searchItems.length > 0">{{viewModel.selectItemsLabel}}</ion-item>',
                    '<ion-item collection-repeat="item in viewModel.searchItems" item-height="55px" item-width="100%" ng-click="viewModel.selectItem(item)" class="item-text-wrap">',
                    '{{viewModel.getItemValue(item, viewModel.itemViewValueKey)}}',
                    '</ion-item>',
                    '</ion-content>',
                    '</div>'
                ].join('');

                // load the template synchronously or asynchronously
                $q.when().then(function () {

                    // first check if a template url is set and use this as template
                    if (ionAutocompleteController.templateUrl) {
                        return $templateRequest(ionAutocompleteController.templateUrl);
                    } else {
                        return template;
                    }
                }).then(function (template) {

                    // compile the template
                    var searchInputElement = $compile(angular.element(template))(scope);

                    // append the template to body
                    $document.find('body').append(searchInputElement);


                    // returns the value of an item
                    ionAutocompleteController.getItemValue = function (item, key) {

                        // if it's an array, go through all items and add the values to a new array and return it
                        if (angular.isArray(item)) {
                            var items = [];
                            angular.forEach(item, function (itemValue) {
                                if (key && angular.isObject(item)) {
                                    items.push($parse(key)(itemValue));
                                } else {
                                    items.push(itemValue);
                                }
                            });
                            return items;
                        } else {
                            if (key && angular.isObject(item)) {
                                return $parse(key)(item);
                            }
                        }
                        return item;
                    };

                    // function which selects the item, hides the search container and the ionic backdrop if it has not maximum selected items attribute set
                    ionAutocompleteController.selectItem = function (item) {

                        // clear the search query when an item is selected
                        ionAutocompleteController.searchQuery = undefined;

                        // return if the max selected items is not equal to 1 and the maximum amount of selected items is reached
                        if (ionAutocompleteController.maxSelectedItems != "1" &&
                            ionAutocompleteController.maxSelectedItems == ionAutocompleteController.selectedItems.length) {
                            return;
                        }

                        // store the selected items
                        if (!isKeyValueInObjectArray(ionAutocompleteController.selectedItems,
                                ionAutocompleteController.itemValueKey, ionAutocompleteController.getItemValue(item, ionAutocompleteController.itemValueKey))) {

                            // if it is a single select set the item directly
                            if (ionAutocompleteController.maxSelectedItems == "1") {
                                ionAutocompleteController.selectedItems = [item];
                            } else {
                                // create a new array to update the model. See https://github.com/angular-ui/ui-select/issues/191#issuecomment-55471732
                                ionAutocompleteController.selectedItems = ionAutocompleteController.selectedItems.concat([item]);
                            }
                        }

                        // set the view value and render it
                        ngModelController.$setViewValue(ionAutocompleteController.selectedItems);
                        ngModelController.$render();

                        // hide the container and the ionic backdrop if it is a single select to enhance usability
                        if (ionAutocompleteController.maxSelectedItems == 1) {
                            ionAutocompleteController.hideModal();
                        }

                        // call items clicked callback
                        if (angular.isDefined(attrs.itemsClickedMethod)) {
                            ionAutocompleteController.itemsClickedMethod({
                                callback: {
                                    item: item,
                                    selectedItems: ionAutocompleteController.selectedItems.slice(),
                                    componentId: ionAutocompleteController.componentId
                                }
                            });
                        }
                    };

                    // function which removes the item from the selected items.
                    ionAutocompleteController.removeItem = function (index) {
                        // remove the item from the selected items and create a copy of the array to update the model.
                        // See https://github.com/angular-ui/ui-select/issues/191#issuecomment-55471732
                        var removed = ionAutocompleteController.selectedItems.splice(index, 1)[0];
                        ionAutocompleteController.selectedItems = ionAutocompleteController.selectedItems.slice();

                        // set the view value and render it
                        ngModelController.$setViewValue(ionAutocompleteController.selectedItems);
                        ngModelController.$render();

                        // call items clicked callback
                        if (angular.isDefined(attrs.itemsRemovedMethod)) {
                            ionAutocompleteController.itemsRemovedMethod({
                                callback: {
                                    item: removed,
                                    selectedItems: ionAutocompleteController.selectedItems.slice(),
                                    componentId: ionAutocompleteController.componentId
                                }
                            });
                        }
                    };

                    // watcher on the search field model to update the list according to the input
                    scope.$watch('viewModel.searchQuery', function (query) {
                        ionAutocompleteController.fetchSearchQuery(query, false);
                    });

                    // update the search items based on the returned value of the items-method
                    ionAutocompleteController.fetchSearchQuery = function (query, isInitializing) {

                        // right away return if the query is undefined to not call the items method for nothing
                        if (query === undefined) {
                            return;
                        }

                        if (angular.isDefined(attrs.itemsMethod)) {

                            // show the loading icon
                            ionAutocompleteController.showLoadingIcon = true;

                            var queryObject = {query: query, isInitializing: isInitializing};

                            // if the component id is set, then add it to the query object
                            if (ionAutocompleteController.componentId) {
                                queryObject = {
                                    query: query,
                                    isInitializing: isInitializing,
                                    componentId: ionAutocompleteController.componentId
                                }
                            }

                            // convert the given function to a $q promise to support promises too
                            var promise = $q.when(ionAutocompleteController.itemsMethod(queryObject));

                            promise.then(function (promiseData) {

                                // if the promise data is not set do nothing
                                if (!promiseData) {
                                    return;
                                }

                                // if the given promise data object has a data property use this for the further processing as the
                                // standard httpPromises from the $http functions store the response data in a data property
                                if (promiseData && promiseData.data) {
                                    promiseData = promiseData.data;
                                }

                                // set the items which are returned by the items method
                                ionAutocompleteController.searchItems = ionAutocompleteController.getItemValue(promiseData,
                                    ionAutocompleteController.itemsMethodValueKey);

                                // force the collection repeat to redraw itself as there were issues when the first items were added
                                $ionicScrollDelegate.resize();

                                // hide the loading icon
                                ionAutocompleteController.showLoadingIcon = false;
                            }, function (error) {
                                // reject the error because we do not handle the error here
                                return $q.reject(error);
                            });
                        }
                    };

                    var searchContainerDisplayed = false;

                    ionAutocompleteController.showModal = function () {
                        if (searchContainerDisplayed) {
                            return;
                        }

                        // show the backdrop and the search container
                        $ionicBackdrop.retain();
                        angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass)).css('display', 'block');

                        // hide the container if the back button is pressed
                        scope.$deregisterBackButton = $ionicPlatform.registerBackButtonAction(function () {
                            ionAutocompleteController.hideModal();
                        }, 300);

                        // get the compiled search field
                        var searchInputElement = angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass + ' input'));

                        // focus on the search input field
                        if (searchInputElement.length > 0) {
                            searchInputElement[0].focus();
                            setTimeout(function () {
                                searchInputElement[0].focus();
                            }, 0);
                        }

                        // force the collection repeat to redraw itself as there were issues when the first items were added
                        $ionicScrollDelegate.resize();

                        searchContainerDisplayed = true;
                    };

                    ionAutocompleteController.hideModal = function () {
                        angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass)).css('display', 'none');
                        ionAutocompleteController.searchQuery = undefined;
                        $ionicBackdrop.release();
                        scope.$deregisterBackButton && scope.$deregisterBackButton();
                        searchContainerDisplayed = false;
                    };

                    // object to store if the user moved the finger to prevent opening the modal
                    var scrolling = {
                        moved: false,
                        startX: 0,
                        startY: 0
                    };

                    // store the start coordinates of the touch start event
                    var onTouchStart = function (e) {
                        scrolling.moved = false;
                        // Use originalEvent when available, fix compatibility with jQuery
                        if (typeof(e.originalEvent) !== 'undefined') {
                            e = e.originalEvent;
                        }
                        scrolling.startX = e.touches[0].clientX;
                        scrolling.startY = e.touches[0].clientY;
                    };

                    // check if the finger moves more than 10px and set the moved flag to true
                    var onTouchMove = function (e) {
                        // Use originalEvent when available, fix compatibility with jQuery
                        if (typeof(e.originalEvent) !== 'undefined') {
                            e = e.originalEvent;
                        }
                        if (Math.abs(e.touches[0].clientX - scrolling.startX) > 10 ||
                            Math.abs(e.touches[0].clientY - scrolling.startY) > 10) {
                            scrolling.moved = true;
                        }
                    };

                    // click handler on the input field to show the search container
                    var onClick = function (event) {
                        // only open the dialog if was not touched at the beginning of a legitimate scroll event
                        if (scrolling.moved) {
                            return;
                        }

                        // prevent the default event and the propagation
                        event.preventDefault();
                        event.stopPropagation();

                        // call the fetch search query method once to be able to initialize it when the modal is shown
                        // use an empty string to signal that there is no change in the search query
                        ionAutocompleteController.fetchSearchQuery("", true);

                        // show the ionic backdrop and the search container
                        ionAutocompleteController.showModal();
                    };

                    var isKeyValueInObjectArray = function (objectArray, key, value) {
                        for (var i = 0; i < objectArray.length; i++) {
                            if (ionAutocompleteController.getItemValue(objectArray[i], key) === value) {
                                return true;
                            }
                        }
                        return false;
                    };

                    // function to call the model to item method and select the item
                    var resolveAndSelectModelItem = function (modelValue) {
                        // convert the given function to a $q promise to support promises too
                        var promise = $q.when(ionAutocompleteController.modelToItemMethod({modelValue: modelValue}));

                        promise.then(function (promiseData) {
                            // select the item which are returned by the model to item method
                            ionAutocompleteController.selectItem(promiseData);
                        }, function (error) {
                            // reject the error because we do not handle the error here
                            return $q.reject(error);
                        });
                    };

                    // if the click is not handled externally, bind the handlers to the click and touch events of the input field
                    if (ionAutocompleteController.manageExternally == "false") {
                        element.bind('touchstart', onTouchStart);
                        element.bind('touchmove', onTouchMove);
                        element.bind('touchend click focus', onClick);
                    }

                    // cancel handler for the cancel button which clears the search input field model and hides the
                    // search container and the ionic backdrop and calls the cancel button clicked callback
                    ionAutocompleteController.cancelClick = function () {
                        ionAutocompleteController.hideModal();

                        // call cancel button clicked callback
                        if (angular.isDefined(attrs.cancelButtonClickedMethod)) {
                            ionAutocompleteController.cancelButtonClickedMethod({
                                callback: {
                                    selectedItems: ionAutocompleteController.selectedItems.slice(),
                                    componentId: ionAutocompleteController.componentId
                                }
                            });
                        }
                    };

                    // watch the external model for changes and select the items inside the model
                    scope.$watch("viewModel.externalModel", function (newModel) {

                        if (angular.isArray(newModel) && newModel.length == 0) {
                            // clear the selected items and set the view value and render it
                            ionAutocompleteController.selectedItems = [];
                            ngModelController.$setViewValue(ionAutocompleteController.selectedItems);
                            ngModelController.$render();
                            return;
                        }

                        // prepopulate view and selected items if external model is already set
                        if (newModel && angular.isDefined(attrs.modelToItemMethod)) {
                            if (angular.isArray(newModel)) {
                                ionAutocompleteController.selectedItems = [];
                                angular.forEach(newModel, function (modelValue) {
                                    resolveAndSelectModelItem(modelValue);
                                })
                            } else {
                                resolveAndSelectModelItem(newModel);
                            }
                        }
                    });

                    // remove the component from the dom when scope is getting destroyed
                    scope.$on('$destroy', function () {

                        // angular takes care of cleaning all $watch's and listeners, but we still need to remove the modal
                        searchInputElement.remove();
                    });

                    // render the view value of the model
                    ngModelController.$render = function () {
                        element.val(ionAutocompleteController.getItemValue(ngModelController.$viewValue, ionAutocompleteController.itemViewValueKey));
                    };

                    // set the view value of the model
                    ngModelController.$formatters.push(function (modelValue) {
                        var viewValue = ionAutocompleteController.getItemValue(modelValue, ionAutocompleteController.itemViewValueKey);
                        return viewValue == undefined ? "" : viewValue;
                    });

                    // set the model value of the model
                    ngModelController.$parsers.push(function (viewValue) {
                        return ionAutocompleteController.getItemValue(viewValue, ionAutocompleteController.itemValueKey);
                    });

                });

            }
        };
    }
]);

})();
; browserify_shim__define__module__export__(typeof ionAutocomplete != "undefined" ? ionAutocomplete : window.ionAutocomplete);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
angular.module('ionic.wizard', [])
    .directive('ionWizardContent', ['ionContentDirective', function(ionContentDirective) {
      return angular.extend({}, ionContentDirective[0], { scope: false });
    }])
    .directive('ionWizard', ['$rootScope', '$ionicSlideBoxDelegate', function($rootScope, $ionicSlideBoxDelegate) {
        return{
            restrict: 'EA',
            controller: [function() {
                var conditions = [];

                this.addCondition = function(condition) {
                    conditions.push(condition);
                };

                this.getCondition = function(index) {
                    return conditions[index];
                };

                this.checkNextCondition = function(index) {
                    return index > (conditions.length - 1)
                        ? false
                        : conditions[index].next();
                };

                this.checkPreviousCondition = function(index) {
                    return index > (conditions.length - 1)
                        ? false
                        : conditions[index].prev();
                };

            }],
            link: function (scope, element, attrs, controller) {
                var currentIndex = 0;

                $ionicSlideBoxDelegate.enableSlide(false);

                element.css('height', '100%');

                scope.$on("wizard:Previous", function() {
                    $ionicSlideBoxDelegate.previous();
                });
                scope.$on("wizard:Next", function() {
                    $ionicSlideBoxDelegate.next();
                });

                // watch the current index's condition for changes and broadcast the new condition state on change
                scope.$watch(function() {
                    return controller.checkNextCondition(currentIndex) && controller.checkPreviousCondition(currentIndex);
                }, function() {
                    $rootScope.$broadcast("wizard:NextCondition", controller.checkNextCondition(currentIndex));
                    $rootScope.$broadcast("wizard:PreviousCondition", controller.checkPreviousCondition(currentIndex));                    
                });

                scope.$on("slideBox.slideChanged", function(e, index) {
                    currentIndex = index;
                });
            }
        }

    }])
    .directive('ionWizardStep', ['$q', function($q) {
        return {
            restrict: 'EA',
            scope: {
                nextConditionFn: '&nextCondition',
                prevConditionFn: "&prevCondition"
            },
            require: '^^ionWizard',
            link: function(scope, element, attrs, controller) {
                var nextFn = function() {
                    // if there's no condition, just set the condition to true, otherwise evaluate
                    return angular.isUndefined(attrs.nextCondition)
                        ? true
                        : scope.nextConditionFn();
                };

                var prevFn = function() {
                    return angular.isUndefined(attrs.prevCondition)
                        ? true
                        : scope.prevConditionFn();
                };

                var conditions = {
                    next: nextFn,
                    prev: prevFn
                };

                controller.addCondition(conditions);
            }
        }
    }])
    .directive('ionWizardPrevious', ['$rootScope', '$ionicSlideBoxDelegate', function($rootScope, $ionicSlideBoxDelegate) {
        return{
            restrict: 'EA',
            scope: {},
            link: function(scope, element, attrs, controller) {

                if ($ionicSlideBoxDelegate.currentIndex() == 0){
                    element.addClass('ng-hide');
                }

                element.on('click', function() {
                    $rootScope.$broadcast("wizard:Previous");
                });

                scope.$on("slideBox.slideChanged", function(e, index) {
                    element.toggleClass('ng-hide', index == 0);
                });
                
                scope.$on("wizard:PreviousCondition", function(e, condition) {
                    element.attr("disabled", !condition);
                });
            }
        }
    }])
    .directive('ionWizardNext', ['$rootScope', '$ionicSlideBoxDelegate', function($rootScope, $ionicSlideBoxDelegate) {
        return{
            restrict: 'EA',
            scope: {},
            link: function(scope, element, attrs, controller) {
                if ($ionicSlideBoxDelegate.currentIndex() == $ionicSlideBoxDelegate.slidesCount() - 1){
                    element.addClass('ng-hide');
                }
                element.on('click', function() {
                    $rootScope.$broadcast("wizard:Next");
                });

                scope.$on("slideBox.slideChanged", function(e, index) {
                    element.toggleClass('ng-hide', index == $ionicSlideBoxDelegate.slidesCount() - 1);
                });

                scope.$on("wizard:NextCondition", function(e, condition) {
                    element.attr("disabled", !condition); 
                });
            }
        }
    }])
    .directive('ionWizardStart', ['$ionicSlideBoxDelegate', function($ionicSlideBoxDelegate) {
        return{
            restrict: 'EA',
            scope: {
                startFn: '&ionWizardStart',
                startCondition: '&condition'
            },
            link: function(scope, element, attrs) {
                element.addClass('ng-hide');
                if ($ionicSlideBoxDelegate.currentIndex() == $ionicSlideBoxDelegate.slidesCount() - 1){
                    element.removeClass('ng-hide');
                }

                function checkCondition() {
                    return (angular.isUndefined(attrs.condition)) ? true : scope.startCondition();
                }

                element.on('click', function() {
                    scope.startFn();
                });

                scope.$watch(function() {
                    return checkCondition()
                }, function(result) {
                    element.attr('disabled', !result);
                });

                scope.$on("slideBox.slideChanged", function(e, index) {
                    element.toggleClass('ng-hide', index < $ionicSlideBoxDelegate.slidesCount() - 1);
                });
            }
        }
    }]);

; browserify_shim__define__module__export__(typeof ionicWizard != "undefined" ? ionicWizard : window.ionicWizard);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
'use strict';

function AppMain($ionicPlatform, $rootScope, $state, LocalStorageService, HelperService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function(event, toState) {
    var leadInfo = LocalStorageService.getObject('leadInfo');
    if (toState.name === 'step2' && leadInfo) {
      var template = HelperService.getStep2Template();
      toState.templateUrl = 'js/modules/step2/' + template;
    }
  });
}

// Exports
// -------
module.exports = [
  '$ionicPlatform',
  '$rootScope',
  '$state',
  'LocalStorageService',
  'HelperService',
  AppMain
];

},{}],6:[function(require,module,exports){
'use strict';

require('angular-messages');
require('ionAutocomplete');
require('ionicWizard');
require('./modules/utils');
require('./modules/metadata');
require('./modules/step1');
require('./modules/step2');
require('./modules/step3');
require('./modules/login');

angular.element(document).ready(function() {
  var requires= [
    'ionic',
    'ion-autocomplete',
    'ionic.wizard',
    'ngMessages',
    'app.utils',
    'app.metadata',
    'app.step1',
    'app.step2',
    'app.step3',
    'app.login'
  ];

  module.exports = angular.module('app', requires)
    .constant('AppSettings', require('./constants'))
    .config(require('./router'))
    .run(require('./app-main'));

  angular.bootstrap(document, ['app']);
});

},{"./app-main":5,"./constants":7,"./modules/login":8,"./modules/metadata":10,"./modules/step1":12,"./modules/step2":15,"./modules/step3":18,"./modules/utils":21,"./router":23,"angular-messages":2,"ionAutocomplete":3,"ionicWizard":4}],7:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = {
  apiUrl: 'http://54.179.164.117'
};

},{}],8:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = angular.module('app.login', [])
  .controller('LoginController', require('./login-controller'));


},{"./login-controller":9}],9:[function(require,module,exports){
'use strict';

function LoginController() {
  angular.extend(this, {});
}

// Exports
// -------
module.exports = [
  LoginController
];

},{}],10:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = angular.module('app.metadata', [])
  .factory('MetadataService', require('./metadata-service'));

},{"./metadata-service":11}],11:[function(require,module,exports){
'use strict';

function MetadataService($http, $q, AppSettings) {
  return {
    getAll: function() {
      var deferred = $q.defer();
      $http.get('js/modules/metadata/metadata.json')
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(err, status) {
          deferred.reject(err, status);
        });

      return deferred.promise;
    },

    getMetadata: function() {
      var meta = arguments[0] || 'locations';
      var deferred = $q.defer();
      var req = {
        method: 'GET',
        url: AppSettings.apiUrl + '/' + meta
      };
      $http(req)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(error, status) {
          deferred.reject(error, status);
        });

      return deferred.promise;
    }
  };
}

// Exports
// -------
module.exports = ['$http', '$q', 'AppSettings', MetadataService];

},{}],12:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = angular.module('app.step1', [])
  .factory('Step1Service', require('./step1-service'))
  .controller('Step1Controller', require('./step1-controller'));

},{"./step1-controller":13,"./step1-service":14}],13:[function(require,module,exports){
'use strict';

function Step1Controller(metadata, locations, Step1Service, LocalStorageService, $ionicLoading, $ionicPopup, $state, $filter) {
  var self = this;
  var validLoanTypes = metadata.loan.types;
  var type = $state.params.type;
  var loanType = type && validLoanTypes.indexOf(type.toLowerCase()) !== -1 ? type : 'personal';

  var model = {
    applications: [
      { type: loanType }
    ]
  };

  function apply() {
    $ionicLoading.show({
      template: 'Processing...'
    });

    Step1Service.create(self.model)
    .then(function(response) {
      LocalStorageService.setObject('leadInfo', response);
      $state.go('step2');
    })
    .catch(function(err) {
      var leadInfo = err.leadInfo;
      if (err.statusCode === 409) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Hi ' + leadInfo.profile.firstname + '!',
          template: [
            'We found out that you have an existing ',
            '<strong>' + leadInfo.application.type + ' loan</strong> application ',
            'using the same email address or mobile number that you provided. ',
            'Do you want to proceed to the next step?'
          ].join(''),
          cancelText: 'No',
          okText: 'Yes'
        });
        confirmPopup.then(function(res) {
          if (res) {
            switch (leadInfo.status) {
              case '1':
                LocalStorageService.setObject('leadInfo', leadInfo);
                $state.go('step2');
                break;
              case '2':
                LocalStorageService.setObject('leadInfo', leadInfo);
                //$state.go('step3');
                break;
              default:
                //$state.go('login');
            }
          }
        });
      } else {
        $ionicPopup.alert({
         title: 'Oops...',
         template: 'There was an error processing your request.'
        });
      }
    })
    .finally(function() {
      $ionicLoading.hide();
    });
  }

  function getLocations(searchText) {
    var filtered = [];
    if (searchText) {
      angular.forEach(locations, function(location) {
        if (location.cityName.toLowerCase().indexOf(searchText) >= 0) {
          filtered.push(location);
        }
      });
    }

    return filtered;
  }

  function itemsClicked(callback) {
    self.model.profile.address = callback.item.cityName;
  }

  function itemsRemoved(callback) {
    self.model.profile.address = '';
  }

  angular.extend(this, {
    apply: apply,
    model: model,
    errorMessages: metadata.errorMessages,
    getLocations: getLocations,
    incomeSources: metadata.incomeSources,
    itemsClicked: itemsClicked,
    itemsRemoved: itemsRemoved
  });
}

// Exports
// -------
module.exports = [
  'metadata',
  'locations',
  'Step1Service',
  'LocalStorageService',
  '$ionicLoading',
  '$ionicPopup',
  '$state',
  '$filter',
  Step1Controller
];

},{}],14:[function(require,module,exports){
'use strict';

function Step1Service($http, $q, AppSettings) {
  return {
    create: function(data) {
      var deferred = $q.defer();
      var req = {
        method: 'POST',
        url: AppSettings.apiUrl + '/leads',
        data: data
      };
      $http(req)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(error, status) {
          deferred.reject(error, status);
        });

      return deferred.promise;
    }
  };
}

// Exports
// -------
module.exports = ['$http', '$q', 'AppSettings', Step1Service];

},{}],15:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = angular.module('app.step2', [])
  .factory('Step2Service', require('./step2-service'))
  .controller('Step2Controller', require('./step2-controller'));

},{"./step2-controller":16,"./step2-service":17}],16:[function(require,module,exports){
'use strict';

function Step2Controller(metadata) {
  var self = this;
  var model = {};

  function getIndustries(searchText) {
    var filtered = [];
    if (searchText) {
      angular.forEach(metadata.company.industries, function(industry) {
        if (industry.text.toLowerCase().indexOf(searchText) >= 0) {
          filtered.push(industry);
        }
      });
    }

    return filtered;
  }

  function industryClicked(callback) {
    self.model.company.industry = callback.item.text;
  }

  function industryRemoved(callback) {
    self.model.company.industry = '';
  }

  angular.extend(this, {
    model: model,
    maxMonth: new Date(),
    errorMessages: metadata.errorMessages,
    registrars: metadata.company.registrars,
    getIndustries: getIndustries,
    industryClicked: industryClicked,
    industryRemoved: industryRemoved
  });
}

// Exports
// -------
module.exports = [
  'metadata',
  Step2Controller
];

},{}],17:[function(require,module,exports){
'use strict';

function Step2Service($http, $q, AppSettings) {
  return {};
}

// Exports
// -------
module.exports = ['$http', '$q', 'AppSettings', Step2Service];

},{}],18:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = angular.module('app.step3', [])
  .controller('Step3Controller', require('./step3-controller'));

},{"./step3-controller":19}],19:[function(require,module,exports){
'use strict';

function Step3Controller() {
  angular.extend(this, {});
}

// Exports
// -------
module.exports = [
  Step3Controller
];

},{}],20:[function(require,module,exports){
'use strict';

function HelperService() {
  return {
    getStep2Template: function() {
      return 'step2-employment.html';
    }
  };
}

// Exports
// -------
module.exports = [HelperService];

},{}],21:[function(require,module,exports){
'use strict';

// Exports
// -------
module.exports = angular.module('app.utils', [])
  .factory('LocalStorageService', require('./localstorage-service'))
  .factory('HelperService', require('./helper-service'));

},{"./helper-service":20,"./localstorage-service":22}],22:[function(require,module,exports){
'use strict';

function LocalStorageService($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}

// Exports
// -------
module.exports = ['$window', LocalStorageService];

},{}],23:[function(require,module,exports){
'use strict';

function Router($stateProvider, $locationProvider, $urlRouterProvider) {
  // $locationProvider.html5Mode({
  //   enabled: true,
  //   requireBase: false
  // });

  $stateProvider
  .state('step1', {
    url: '/apply?type',
    templateUrl: 'js/modules/step1/step1.html',
    controller: 'Step1Controller',
    controllerAs: 'vm',
    resolve: {
      metadata: ['MetadataService', function(MetadataService) {
        return MetadataService.getAll();
      }],
      locations: ['MetadataService', function(MetadataService) {
        return MetadataService.getMetadata('locations?filter[attributes][1]=cityName');
      }]
    }
  })
  .state('step2', {
    url: '/info',
    controller: 'Step2Controller',
    controllerAs: 'vm',
    resolve: {
      metadata: ['MetadataService', function(MetadataService) {
        return MetadataService.getAll();
      }]
    }
  })
  .state('step3', {
    url: '/verify',
    templateUrl: 'js/modules/step3/step3.html',
    controller: 'Step3Controller',
    controllerAs: 'vm'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'js/modules/login/login.html',
    controller: 'LoginController',
    controllerAs: 'vm'
  });

  // $urlRouterProvider.otherwise('/apply');
}

// Exports
// -------
module.exports = [
  '$stateProvider',
  '$locationProvider',
  '$urlRouterProvider',
  Router
];

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1tZXNzYWdlcy9hbmd1bGFyLW1lc3NhZ2VzLmpzIiwibm9kZV9tb2R1bGVzL2FuZ3VsYXItbWVzc2FnZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaW9uLWF1dG9jb21wbGV0ZS9kaXN0L2lvbi1hdXRvY29tcGxldGUuanMiLCJub2RlX21vZHVsZXMvaW9uaWMtd2l6YXJkL2Rpc3QvaW9uLXdpemFyZC5qcyIsInd3dy9qcy9hcHAtbWFpbi5qcyIsInd3dy9qcy9hcHAuanMiLCJ3d3cvanMvY29uc3RhbnRzLmpzIiwid3d3L2pzL21vZHVsZXMvbG9naW4vaW5kZXguanMiLCJ3d3cvanMvbW9kdWxlcy9sb2dpbi9sb2dpbi1jb250cm9sbGVyLmpzIiwid3d3L2pzL21vZHVsZXMvbWV0YWRhdGEvaW5kZXguanMiLCJ3d3cvanMvbW9kdWxlcy9tZXRhZGF0YS9tZXRhZGF0YS1zZXJ2aWNlLmpzIiwid3d3L2pzL21vZHVsZXMvc3RlcDEvaW5kZXguanMiLCJ3d3cvanMvbW9kdWxlcy9zdGVwMS9zdGVwMS1jb250cm9sbGVyLmpzIiwid3d3L2pzL21vZHVsZXMvc3RlcDEvc3RlcDEtc2VydmljZS5qcyIsInd3dy9qcy9tb2R1bGVzL3N0ZXAyL2luZGV4LmpzIiwid3d3L2pzL21vZHVsZXMvc3RlcDIvc3RlcDItY29udHJvbGxlci5qcyIsInd3dy9qcy9tb2R1bGVzL3N0ZXAyL3N0ZXAyLXNlcnZpY2UuanMiLCJ3d3cvanMvbW9kdWxlcy9zdGVwMy9pbmRleC5qcyIsInd3dy9qcy9tb2R1bGVzL3N0ZXAzL3N0ZXAzLWNvbnRyb2xsZXIuanMiLCJ3d3cvanMvbW9kdWxlcy91dGlscy9oZWxwZXItc2VydmljZS5qcyIsInd3dy9qcy9tb2R1bGVzL3V0aWxzL2luZGV4LmpzIiwid3d3L2pzL21vZHVsZXMvdXRpbHMvbG9jYWxzdG9yYWdlLXNlcnZpY2UuanMiLCJ3d3cvanMvcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3cUJBO0FBQ0E7QUFDQTs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS40LjdcbiAqIChjKSAyMDEwLTIwMTUgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhciwgdW5kZWZpbmVkKSB7J3VzZSBzdHJpY3QnO1xuXG4vKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG4vLyB0aGlzIGNvZGUgaXMgaW4gdGhlIGNvcmUsIGJ1dCBub3QgaW4gYW5ndWxhci1tZXNzYWdlcy5qc1xudmFyIGlzQXJyYXkgPSBhbmd1bGFyLmlzQXJyYXk7XG52YXIgZm9yRWFjaCA9IGFuZ3VsYXIuZm9yRWFjaDtcbnZhciBpc1N0cmluZyA9IGFuZ3VsYXIuaXNTdHJpbmc7XG52YXIganFMaXRlID0gYW5ndWxhci5lbGVtZW50O1xuLyoganNoaW50IGlnbm9yZTplbmQgKi9cblxuLyoqXG4gKiBAbmdkb2MgbW9kdWxlXG4gKiBAbmFtZSBuZ01lc3NhZ2VzXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBUaGUgYG5nTWVzc2FnZXNgIG1vZHVsZSBwcm92aWRlcyBlbmhhbmNlZCBzdXBwb3J0IGZvciBkaXNwbGF5aW5nIG1lc3NhZ2VzIHdpdGhpbiB0ZW1wbGF0ZXNcbiAqICh0eXBpY2FsbHkgd2l0aGluIGZvcm1zIG9yIHdoZW4gcmVuZGVyaW5nIG1lc3NhZ2Ugb2JqZWN0cyB0aGF0IHJldHVybiBrZXkvdmFsdWUgZGF0YSkuXG4gKiBJbnN0ZWFkIG9mIHJlbHlpbmcgb24gSmF2YVNjcmlwdCBjb2RlIGFuZC9vciBjb21wbGV4IG5nLWlmIHN0YXRlbWVudHMgd2l0aGluIHlvdXIgZm9ybSB0ZW1wbGF0ZSB0b1xuICogc2hvdyBhbmQgaGlkZSBlcnJvciBtZXNzYWdlcyBzcGVjaWZpYyB0byB0aGUgc3RhdGUgb2YgYW4gaW5wdXQgZmllbGQsIHRoZSBgbmdNZXNzYWdlc2AgYW5kXG4gKiBgbmdNZXNzYWdlYCBkaXJlY3RpdmVzIGFyZSBkZXNpZ25lZCB0byBoYW5kbGUgdGhlIGNvbXBsZXhpdHksIGluaGVyaXRhbmNlIGFuZCBwcmlvcml0eVxuICogc2VxdWVuY2luZyBiYXNlZCBvbiB0aGUgb3JkZXIgb2YgaG93IHRoZSBtZXNzYWdlcyBhcmUgZGVmaW5lZCBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogQ3VycmVudGx5LCB0aGUgbmdNZXNzYWdlcyBtb2R1bGUgb25seSBjb250YWlucyB0aGUgY29kZSBmb3IgdGhlIGBuZ01lc3NhZ2VzYCwgYG5nTWVzc2FnZXNJbmNsdWRlYFxuICogYG5nTWVzc2FnZWAgYW5kIGBuZ01lc3NhZ2VFeHBgIGRpcmVjdGl2ZXMuXG4gKlxuICogIyBVc2FnZVxuICogVGhlIGBuZ01lc3NhZ2VzYCBkaXJlY3RpdmUgbGlzdGVucyBvbiBhIGtleS92YWx1ZSBjb2xsZWN0aW9uIHdoaWNoIGlzIHNldCBvbiB0aGUgbmdNZXNzYWdlcyBhdHRyaWJ1dGUuXG4gKiBTaW5jZSB0aGUge0BsaW5rIG5nTW9kZWwgbmdNb2RlbH0gZGlyZWN0aXZlIGV4cG9zZXMgYW4gYCRlcnJvcmAgb2JqZWN0LCB0aGlzIGVycm9yIG9iamVjdCBjYW4gYmVcbiAqIHVzZWQgd2l0aCBgbmdNZXNzYWdlc2AgdG8gZGlzcGxheSBjb250cm9sIGVycm9yIG1lc3NhZ2VzIGluIGFuIGVhc2llciB3YXkgdGhhbiB3aXRoIGp1c3QgcmVndWxhciBhbmd1bGFyXG4gKiB0ZW1wbGF0ZSBkaXJlY3RpdmVzLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxmb3JtIG5hbWU9XCJteUZvcm1cIj5cbiAqICAgPGxhYmVsPlxuICogICAgIEVudGVyIHRleHQ6XG4gKiAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCJmaWVsZFwiIG5hbWU9XCJteUZpZWxkXCIgcmVxdWlyZWQgbWlubGVuZ3RoPVwiNVwiIC8+XG4gKiAgIDwvbGFiZWw+XG4gKiAgIDxkaXYgbmctbWVzc2FnZXM9XCJteUZvcm0ubXlGaWVsZC4kZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAqICAgICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPllvdSBkaWQgbm90IGVudGVyIGEgZmllbGQ8L2Rpdj5cbiAqICAgICA8ZGl2IG5nLW1lc3NhZ2U9XCJtaW5sZW5ndGgsIG1heGxlbmd0aFwiPlxuICogICAgICAgWW91ciBlbWFpbCBtdXN0IGJlIGJldHdlZW4gNSBhbmQgMTAwIGNoYXJhY3RlcnMgbG9uZ1xuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZm9ybT5cbiAqIGBgYFxuICpcbiAqIE5vdyB3aGF0ZXZlciBrZXkvdmFsdWUgZW50cmllcyBhcmUgcHJlc2VudCB3aXRoaW4gdGhlIHByb3ZpZGVkIG9iamVjdCAoaW4gdGhpcyBjYXNlIGAkZXJyb3JgKSB0aGVuXG4gKiB0aGUgbmdNZXNzYWdlcyBkaXJlY3RpdmUgd2lsbCByZW5kZXIgdGhlIGlubmVyIGZpcnN0IG5nTWVzc2FnZSBkaXJlY3RpdmUgKGRlcGVuZGluZyBpZiB0aGUga2V5IHZhbHVlc1xuICogbWF0Y2ggdGhlIGF0dHJpYnV0ZSB2YWx1ZSBwcmVzZW50IG9uIGVhY2ggbmdNZXNzYWdlIGRpcmVjdGl2ZSkuIEluIG90aGVyIHdvcmRzLCBpZiB5b3VyIGVycm9yc1xuICogb2JqZWN0IGNvbnRhaW5zIHRoZSBmb2xsb3dpbmcgZGF0YTpcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiA8IS0tIGtlZXAgaW4gbWluZCB0aGF0IG5nTW9kZWwgYXV0b21hdGljYWxseSBzZXRzIHRoZXNlIGVycm9yIGZsYWdzIC0tPlxuICogbXlGaWVsZC4kZXJyb3IgPSB7IG1pbmxlbmd0aCA6IHRydWUsIHJlcXVpcmVkIDogdHJ1ZSB9O1xuICogYGBgXG4gKlxuICogVGhlbiB0aGUgYHJlcXVpcmVkYCBtZXNzYWdlIHdpbGwgYmUgZGlzcGxheWVkIGZpcnN0LiBXaGVuIHJlcXVpcmVkIGlzIGZhbHNlIHRoZW4gdGhlIGBtaW5sZW5ndGhgIG1lc3NhZ2VcbiAqIHdpbGwgYmUgZGlzcGxheWVkIHJpZ2h0IGFmdGVyIChzaW5jZSB0aGVzZSBtZXNzYWdlcyBhcmUgb3JkZXJlZCB0aGlzIHdheSBpbiB0aGUgdGVtcGxhdGUgSFRNTCBjb2RlKS5cbiAqIFRoZSBwcmlvcml0aXphdGlvbiBvZiBlYWNoIG1lc3NhZ2UgaXMgZGV0ZXJtaW5lZCBieSB3aGF0IG9yZGVyIHRoZXkncmUgcHJlc2VudCBpbiB0aGUgRE9NLlxuICogVGhlcmVmb3JlLCBpbnN0ZWFkIG9mIGhhdmluZyBjdXN0b20gSmF2YVNjcmlwdCBjb2RlIGRldGVybWluZSB0aGUgcHJpb3JpdHkgb2Ygd2hhdCBlcnJvcnMgYXJlXG4gKiBwcmVzZW50IGJlZm9yZSBvdGhlcnMsIHRoZSBwcmVzZW50YXRpb24gb2YgdGhlIGVycm9ycyBhcmUgaGFuZGxlZCB3aXRoaW4gdGhlIHRlbXBsYXRlLlxuICpcbiAqIEJ5IGRlZmF1bHQsIG5nTWVzc2FnZXMgd2lsbCBvbmx5IGRpc3BsYXkgb25lIGVycm9yIGF0IGEgdGltZS4gSG93ZXZlciwgaWYgeW91IHdpc2ggdG8gZGlzcGxheSBhbGxcbiAqIG1lc3NhZ2VzIHRoZW4gdGhlIGBuZy1tZXNzYWdlcy1tdWx0aXBsZWAgYXR0cmlidXRlIGZsYWcgY2FuIGJlIHVzZWQgb24gdGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGVcbiAqIG5nTWVzc2FnZXMgZGlyZWN0aXZlIHRvIG1ha2UgdGhpcyBoYXBwZW4uXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBhdHRyaWJ1dGUtc3R5bGUgdXNhZ2UgLS0+XG4gKiA8ZGl2IG5nLW1lc3NhZ2VzPVwibXlGb3JtLm15RmllbGQuJGVycm9yXCIgbmctbWVzc2FnZXMtbXVsdGlwbGU+Li4uPC9kaXY+XG4gKlxuICogPCEtLSBlbGVtZW50LXN0eWxlIHVzYWdlIC0tPlxuICogPG5nLW1lc3NhZ2VzIGZvcj1cIm15Rm9ybS5teUZpZWxkLiRlcnJvclwiIG11bHRpcGxlPi4uLjwvbmctbWVzc2FnZXM+XG4gKiBgYGBcbiAqXG4gKiAjIyBSZXVzaW5nIGFuZCBPdmVycmlkaW5nIE1lc3NhZ2VzXG4gKiBJbiBhZGRpdGlvbiB0byBwcmlvcml0aXphdGlvbiwgbmdNZXNzYWdlcyBhbHNvIGFsbG93cyBmb3IgaW5jbHVkaW5nIG1lc3NhZ2VzIGZyb20gYSByZW1vdGUgb3IgYW4gaW5saW5lXG4gKiB0ZW1wbGF0ZS4gVGhpcyBhbGxvd3MgZm9yIGdlbmVyaWMgY29sbGVjdGlvbiBvZiBtZXNzYWdlcyB0byBiZSByZXVzZWQgYWNyb3NzIG11bHRpcGxlIHBhcnRzIG9mIGFuXG4gKiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBgYGBodG1sXG4gKiA8c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCJlcnJvci1tZXNzYWdlc1wiPlxuICogICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPlRoaXMgZmllbGQgaXMgcmVxdWlyZWQ8L2Rpdj5cbiAqICAgPGRpdiBuZy1tZXNzYWdlPVwibWlubGVuZ3RoXCI+VGhpcyBmaWVsZCBpcyB0b28gc2hvcnQ8L2Rpdj5cbiAqIDwvc2NyaXB0PlxuICpcbiAqIDxkaXYgbmctbWVzc2FnZXM9XCJteUZvcm0ubXlGaWVsZC4kZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAqICAgPGRpdiBuZy1tZXNzYWdlcy1pbmNsdWRlPVwiZXJyb3ItbWVzc2FnZXNcIj48L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogSG93ZXZlciwgaW5jbHVkaW5nIGdlbmVyaWMgbWVzc2FnZXMgbWF5IG5vdCBiZSB1c2VmdWwgZW5vdWdoIHRvIG1hdGNoIGFsbCBpbnB1dCBmaWVsZHMsIHRoZXJlZm9yZSxcbiAqIGBuZ01lc3NhZ2VzYCBwcm92aWRlcyB0aGUgYWJpbGl0eSB0byBvdmVycmlkZSBtZXNzYWdlcyBkZWZpbmVkIGluIHRoZSByZW1vdGUgdGVtcGxhdGUgYnkgcmVkZWZpbmluZ1xuICogdGhlbSB3aXRoaW4gdGhlIGRpcmVjdGl2ZSBjb250YWluZXIuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBhIGdlbmVyaWMgdGVtcGxhdGUgb2YgZXJyb3IgbWVzc2FnZXMga25vd24gYXMgXCJteS1jdXN0b20tbWVzc2FnZXNcIiAtLT5cbiAqIDxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cIm15LWN1c3RvbS1tZXNzYWdlc1wiPlxuICogICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPlRoaXMgZmllbGQgaXMgcmVxdWlyZWQ8L2Rpdj5cbiAqICAgPGRpdiBuZy1tZXNzYWdlPVwibWlubGVuZ3RoXCI+VGhpcyBmaWVsZCBpcyB0b28gc2hvcnQ8L2Rpdj5cbiAqIDwvc2NyaXB0PlxuICpcbiAqIDxmb3JtIG5hbWU9XCJteUZvcm1cIj5cbiAqICAgPGxhYmVsPlxuICogICAgIEVtYWlsIGFkZHJlc3NcbiAqICAgICA8aW5wdXQgdHlwZT1cImVtYWlsXCJcbiAqICAgICAgICAgICAgaWQ9XCJlbWFpbFwiXG4gKiAgICAgICAgICAgIG5hbWU9XCJteUVtYWlsXCJcbiAqICAgICAgICAgICAgbmctbW9kZWw9XCJlbWFpbFwiXG4gKiAgICAgICAgICAgIG1pbmxlbmd0aD1cIjVcIlxuICogICAgICAgICAgICByZXF1aXJlZCAvPlxuICogICA8L2xhYmVsPlxuICogICA8IS0tIGFueSBuZy1tZXNzYWdlIGVsZW1lbnRzIHRoYXQgYXBwZWFyIEJFRk9SRSB0aGUgbmctbWVzc2FnZXMtaW5jbHVkZSB3aWxsXG4gKiAgICAgICAgb3ZlcnJpZGUgdGhlIG1lc3NhZ2VzIHByZXNlbnQgaW4gdGhlIG5nLW1lc3NhZ2VzLWluY2x1ZGUgdGVtcGxhdGUgLS0+XG4gKiAgIDxkaXYgbmctbWVzc2FnZXM9XCJteUZvcm0ubXlFbWFpbC4kZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAqICAgICA8IS0tIHRoaXMgcmVxdWlyZWQgbWVzc2FnZSBoYXMgb3ZlcnJpZGRlbiB0aGUgdGVtcGxhdGUgbWVzc2FnZSAtLT5cbiAqICAgICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPllvdSBkaWQgbm90IGVudGVyIHlvdXIgZW1haWwgYWRkcmVzczwvZGl2PlxuICpcbiAqICAgICA8IS0tIHRoaXMgaXMgYSBicmFuZCBuZXcgbWVzc2FnZSBhbmQgd2lsbCBhcHBlYXIgbGFzdCBpbiB0aGUgcHJpb3JpdGl6YXRpb24gLS0+XG4gKiAgICAgPGRpdiBuZy1tZXNzYWdlPVwiZW1haWxcIj5Zb3VyIGVtYWlsIGFkZHJlc3MgaXMgaW52YWxpZDwvZGl2PlxuICpcbiAqICAgICA8IS0tIGFuZCBoZXJlIGFyZSB0aGUgZ2VuZXJpYyBlcnJvciBtZXNzYWdlcyAtLT5cbiAqICAgICA8ZGl2IG5nLW1lc3NhZ2VzLWluY2x1ZGU9XCJteS1jdXN0b20tbWVzc2FnZXNcIj48L2Rpdj5cbiAqICAgPC9kaXY+XG4gKiA8L2Zvcm0+XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGUgZXhhbXBsZSBIVE1MIGNvZGUgYWJvdmUgdGhlIG1lc3NhZ2UgdGhhdCBpcyBzZXQgb24gcmVxdWlyZWQgd2lsbCBvdmVycmlkZSB0aGUgY29ycmVzcG9uZGluZ1xuICogcmVxdWlyZWQgbWVzc2FnZSBkZWZpbmVkIHdpdGhpbiB0aGUgcmVtb3RlIHRlbXBsYXRlLiBUaGVyZWZvcmUsIHdpdGggcGFydGljdWxhciBpbnB1dCBmaWVsZHMgKHN1Y2hcbiAqIGVtYWlsIGFkZHJlc3NlcywgZGF0ZSBmaWVsZHMsIGF1dG9jb21wbGV0ZSBpbnB1dHMsIGV0Yy4uLiksIHNwZWNpYWxpemVkIGVycm9yIG1lc3NhZ2VzIGNhbiBiZSBhcHBsaWVkXG4gKiB3aGlsZSBtb3JlIGdlbmVyaWMgbWVzc2FnZXMgY2FuIGJlIHVzZWQgdG8gaGFuZGxlIG90aGVyLCBtb3JlIGdlbmVyYWwgaW5wdXQgZXJyb3JzLlxuICpcbiAqICMjIER5bmFtaWMgTWVzc2FnaW5nXG4gKiBuZ01lc3NhZ2VzIGFsc28gc3VwcG9ydHMgdXNpbmcgZXhwcmVzc2lvbnMgdG8gZHluYW1pY2FsbHkgY2hhbmdlIGtleSB2YWx1ZXMuIFVzaW5nIGFycmF5cyBhbmRcbiAqIHJlcGVhdGVycyB0byBsaXN0IG1lc3NhZ2VzIGlzIGFsc28gc3VwcG9ydGVkLiBUaGlzIG1lYW5zIHRoYXQgdGhlIGNvZGUgYmVsb3cgd2lsbCBiZSBhYmxlIHRvXG4gKiBmdWxseSBhZGFwdCBpdHNlbGYgYW5kIGRpc3BsYXkgdGhlIGFwcHJvcHJpYXRlIG1lc3NhZ2Ugd2hlbiBhbnkgb2YgdGhlIGV4cHJlc3Npb24gZGF0YSBjaGFuZ2VzOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxmb3JtIG5hbWU9XCJteUZvcm1cIj5cbiAqICAgPGxhYmVsPlxuICogICAgIEVtYWlsIGFkZHJlc3NcbiAqICAgICA8aW5wdXQgdHlwZT1cImVtYWlsXCJcbiAqICAgICAgICAgICAgbmFtZT1cIm15RW1haWxcIlxuICogICAgICAgICAgICBuZy1tb2RlbD1cImVtYWlsXCJcbiAqICAgICAgICAgICAgbWlubGVuZ3RoPVwiNVwiXG4gKiAgICAgICAgICAgIHJlcXVpcmVkIC8+XG4gKiAgIDwvbGFiZWw+XG4gKiAgIDxkaXYgbmctbWVzc2FnZXM9XCJteUZvcm0ubXlFbWFpbC4kZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAqICAgICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPllvdSBkaWQgbm90IGVudGVyIHlvdXIgZW1haWwgYWRkcmVzczwvZGl2PlxuICogICAgIDxkaXYgbmctcmVwZWF0PVwiZXJyb3JNZXNzYWdlIGluIGVycm9yTWVzc2FnZXNcIj5cbiAqICAgICAgIDwhLS0gdXNlIG5nLW1lc3NhZ2UtZXhwIGZvciBhIG1lc3NhZ2Ugd2hvc2Uga2V5IGlzIGdpdmVuIGJ5IGFuIGV4cHJlc3Npb24gLS0+XG4gKiAgICAgICA8ZGl2IG5nLW1lc3NhZ2UtZXhwPVwiZXJyb3JNZXNzYWdlLnR5cGVcIj57eyBlcnJvck1lc3NhZ2UudGV4dCB9fTwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZm9ybT5cbiAqIGBgYFxuICpcbiAqIFRoZSBgZXJyb3JNZXNzYWdlLnR5cGVgIGV4cHJlc3Npb24gY2FuIGJlIGEgc3RyaW5nIHZhbHVlIG9yIGl0IGNhbiBiZSBhbiBhcnJheSBzb1xuICogdGhhdCBtdWx0aXBsZSBlcnJvcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBhIHNpbmdsZSBlcnJvciBtZXNzYWdlOlxuICpcbiAqIGBgYGh0bWxcbiAqICAgPGxhYmVsPlxuICogICAgIEVtYWlsIGFkZHJlc3NcbiAqICAgICA8aW5wdXQgdHlwZT1cImVtYWlsXCJcbiAqICAgICAgICAgICAgbmctbW9kZWw9XCJkYXRhLmVtYWlsXCJcbiAqICAgICAgICAgICAgbmFtZT1cIm15RW1haWxcIlxuICogICAgICAgICAgICBuZy1taW5sZW5ndGg9XCI1XCJcbiAqICAgICAgICAgICAgbmctbWF4bGVuZ3RoPVwiMTAwXCJcbiAqICAgICAgICAgICAgcmVxdWlyZWQgLz5cbiAqICAgPC9sYWJlbD5cbiAqICAgPGRpdiBuZy1tZXNzYWdlcz1cIm15Rm9ybS5teUVtYWlsLiRlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICogICAgIDxkaXYgbmctbWVzc2FnZS1leHA9XCIncmVxdWlyZWQnXCI+WW91IGRpZCBub3QgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzPC9kaXY+XG4gKiAgICAgPGRpdiBuZy1tZXNzYWdlLWV4cD1cIlsnbWlubGVuZ3RoJywgJ21heGxlbmd0aCddXCI+XG4gKiAgICAgICBZb3VyIGVtYWlsIG11c3QgYmUgYmV0d2VlbiA1IGFuZCAxMDAgY2hhcmFjdGVycyBsb25nXG4gKiAgICAgPC9kaXY+XG4gKiAgIDwvZGl2PlxuICogYGBgXG4gKlxuICogRmVlbCBmcmVlIHRvIHVzZSBvdGhlciBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZXMgc3VjaCBhcyBuZy1pZiBhbmQgbmctc3dpdGNoIHRvIGZ1cnRoZXIgY29udHJvbFxuICogd2hhdCBtZXNzYWdlcyBhcmUgYWN0aXZlIGFuZCB3aGVuLiBCZSBjYXJlZnVsLCBpZiB5b3UgcGxhY2UgbmctbWVzc2FnZSBvbiB0aGUgc2FtZSBlbGVtZW50XG4gKiBhcyB0aGVzZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZXMsIEFuZ3VsYXIgbWF5IG5vdCBiZSBhYmxlIHRvIGRldGVybWluZSBpZiBhIG1lc3NhZ2UgaXMgYWN0aXZlXG4gKiBvciBub3QuIFRoZXJlZm9yZSBpdCBpcyBiZXN0IHRvIHBsYWNlIHRoZSBuZy1tZXNzYWdlIG9uIGEgY2hpbGQgZWxlbWVudCBvZiB0aGUgc3RydWN0dXJhbFxuICogZGlyZWN0aXZlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgbmctbWVzc2FnZXM9XCJteUZvcm0ubXlFbWFpbC4kZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAqICAgPGRpdiBuZy1pZj1cInNob3dSZXF1aXJlZEVycm9yXCI+XG4gKiAgICAgPGRpdiBuZy1tZXNzYWdlPVwicmVxdWlyZWRcIj5QbGVhc2UgZW50ZXIgc29tZXRoaW5nPC9kaXY+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiAjIyBBbmltYXRpb25zXG4gKiBJZiB0aGUgYG5nQW5pbWF0ZWAgbW9kdWxlIGlzIGFjdGl2ZSB3aXRoaW4gdGhlIGFwcGxpY2F0aW9uIHRoZW4gdGhlIGBuZ01lc3NhZ2VzYCwgYG5nTWVzc2FnZWAgYW5kXG4gKiBgbmdNZXNzYWdlRXhwYCBkaXJlY3RpdmVzIHdpbGwgdHJpZ2dlciBhbmltYXRpb25zIHdoZW5ldmVyIGFueSBtZXNzYWdlcyBhcmUgYWRkZWQgYW5kIHJlbW92ZWQgZnJvbVxuICogdGhlIERPTSBieSB0aGUgYG5nTWVzc2FnZXNgIGRpcmVjdGl2ZS5cbiAqXG4gKiBXaGVuZXZlciB0aGUgYG5nTWVzc2FnZXNgIGRpcmVjdGl2ZSBjb250YWlucyBvbmUgb3IgbW9yZSB2aXNpYmxlIG1lc3NhZ2VzIHRoZW4gdGhlIGAubmctYWN0aXZlYCBDU1NcbiAqIGNsYXNzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVsZW1lbnQuIFRoZSBgLm5nLWluYWN0aXZlYCBDU1MgY2xhc3Mgd2lsbCBiZSBhcHBsaWVkIHdoZW4gdGhlcmUgYXJlIG5vXG4gKiBtZXNzYWdlcyBwcmVzZW50LiBUaGVyZWZvcmUsIENTUyB0cmFuc2l0aW9ucyBhbmQga2V5ZnJhbWVzIGFzIHdlbGwgYXMgSmF2YVNjcmlwdCBhbmltYXRpb25zIGNhblxuICogaG9vayBpbnRvIHRoZSBhbmltYXRpb25zIHdoZW5ldmVyIHRoZXNlIGNsYXNzZXMgYXJlIGFkZGVkL3JlbW92ZWQuXG4gKlxuICogTGV0J3Mgc2F5IHRoYXQgb3VyIEhUTUwgY29kZSBmb3Igb3VyIG1lc3NhZ2VzIGNvbnRhaW5lciBsb29rcyBsaWtlIHNvOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgbmctbWVzc2FnZXM9XCJteU1lc3NhZ2VzXCIgY2xhc3M9XCJteS1tZXNzYWdlc1wiIHJvbGU9XCJhbGVydFwiPlxuICogICA8ZGl2IG5nLW1lc3NhZ2U9XCJhbGVydFwiIGNsYXNzPVwic29tZS1tZXNzYWdlXCI+Li4uPC9kaXY+XG4gKiAgIDxkaXYgbmctbWVzc2FnZT1cImZhaWxcIiBjbGFzcz1cInNvbWUtbWVzc2FnZVwiPi4uLjwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBUaGVuIHRoZSBDU1MgYW5pbWF0aW9uIGNvZGUgZm9yIHRoZSBtZXNzYWdlIGNvbnRhaW5lciBsb29rcyBsaWtlIHNvOlxuICpcbiAqIGBgYGNzc1xuICogLm15LW1lc3NhZ2VzIHtcbiAqICAgdHJhbnNpdGlvbjoxcyBsaW5lYXIgYWxsO1xuICogfVxuICogLm15LW1lc3NhZ2VzLm5nLWFjdGl2ZSB7XG4gKiAgIC8vIG1lc3NhZ2VzIGFyZSB2aXNpYmxlXG4gKiB9XG4gKiAubXktbWVzc2FnZXMubmctaW5hY3RpdmUge1xuICogICAvLyBtZXNzYWdlcyBhcmUgaGlkZGVuXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaGVuZXZlciBhbiBpbm5lciBtZXNzYWdlIGlzIGF0dGFjaGVkIChiZWNvbWVzIHZpc2libGUpIG9yIHJlbW92ZWQgKGJlY29tZXMgaGlkZGVuKSB0aGVuIHRoZSBlbnRlclxuICogYW5kIGxlYXZlIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgZm9yIGVhY2ggcGFydGljdWxhciBlbGVtZW50IGJvdW5kIHRvIHRoZSBgbmdNZXNzYWdlYCBkaXJlY3RpdmUuXG4gKlxuICogVGhlcmVmb3JlLCB0aGUgQ1NTIGNvZGUgZm9yIHRoZSBpbm5lciBtZXNzYWdlcyBsb29rcyBsaWtlIHNvOlxuICpcbiAqIGBgYGNzc1xuICogLnNvbWUtbWVzc2FnZSB7XG4gKiAgIHRyYW5zaXRpb246MXMgbGluZWFyIGFsbDtcbiAqIH1cbiAqXG4gKiAuc29tZS1tZXNzYWdlLm5nLWVudGVyIHt9XG4gKiAuc29tZS1tZXNzYWdlLm5nLWVudGVyLm5nLWVudGVyLWFjdGl2ZSB7fVxuICpcbiAqIC5zb21lLW1lc3NhZ2UubmctbGVhdmUge31cbiAqIC5zb21lLW1lc3NhZ2UubmctbGVhdmUubmctbGVhdmUtYWN0aXZlIHt9XG4gKiBgYGBcbiAqXG4gKiB7QGxpbmsgbmdBbmltYXRlIENsaWNrIGhlcmV9IHRvIGxlYXJuIGhvdyB0byB1c2UgSmF2YVNjcmlwdCBhbmltYXRpb25zIG9yIHRvIGxlYXJuIG1vcmUgYWJvdXQgbmdBbmltYXRlLlxuICovXG5hbmd1bGFyLm1vZHVsZSgnbmdNZXNzYWdlcycsIFtdKVxuXG4gICAvKipcbiAgICAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAgICAqIEBtb2R1bGUgbmdNZXNzYWdlc1xuICAgICogQG5hbWUgbmdNZXNzYWdlc1xuICAgICogQHJlc3RyaWN0IEFFXG4gICAgKlxuICAgICogQGRlc2NyaXB0aW9uXG4gICAgKiBgbmdNZXNzYWdlc2AgaXMgYSBkaXJlY3RpdmUgdGhhdCBpcyBkZXNpZ25lZCB0byBzaG93IGFuZCBoaWRlIG1lc3NhZ2VzIGJhc2VkIG9uIHRoZSBzdGF0ZVxuICAgICogb2YgYSBrZXkvdmFsdWUgb2JqZWN0IHRoYXQgaXQgbGlzdGVucyBvbi4gVGhlIGRpcmVjdGl2ZSBpdHNlbGYgY29tcGxlbWVudHMgZXJyb3IgbWVzc2FnZVxuICAgICogcmVwb3J0aW5nIHdpdGggdGhlIGBuZ01vZGVsYCAkZXJyb3Igb2JqZWN0ICh3aGljaCBzdG9yZXMgYSBrZXkvdmFsdWUgc3RhdGUgb2YgdmFsaWRhdGlvbiBlcnJvcnMpLlxuICAgICpcbiAgICAqIGBuZ01lc3NhZ2VzYCBtYW5hZ2VzIHRoZSBzdGF0ZSBvZiBpbnRlcm5hbCBtZXNzYWdlcyB3aXRoaW4gaXRzIGNvbnRhaW5lciBlbGVtZW50LiBUaGUgaW50ZXJuYWxcbiAgICAqIG1lc3NhZ2VzIHVzZSB0aGUgYG5nTWVzc2FnZWAgZGlyZWN0aXZlIGFuZCB3aWxsIGJlIGluc2VydGVkL3JlbW92ZWQgZnJvbSB0aGUgcGFnZSBkZXBlbmRpbmdcbiAgICAqIG9uIGlmIHRoZXkncmUgcHJlc2VudCB3aXRoaW4gdGhlIGtleS92YWx1ZSBvYmplY3QuIEJ5IGRlZmF1bHQsIG9ubHkgb25lIG1lc3NhZ2Ugd2lsbCBiZSBkaXNwbGF5ZWRcbiAgICAqIGF0IGEgdGltZSBhbmQgdGhpcyBkZXBlbmRzIG9uIHRoZSBwcmlvcml0aXphdGlvbiBvZiB0aGUgbWVzc2FnZXMgd2l0aGluIHRoZSB0ZW1wbGF0ZS4gKFRoaXMgY2FuXG4gICAgKiBiZSBjaGFuZ2VkIGJ5IHVzaW5nIHRoZSBgbmctbWVzc2FnZXMtbXVsdGlwbGVgIG9yIGBtdWx0aXBsZWAgYXR0cmlidXRlIG9uIHRoZSBkaXJlY3RpdmUgY29udGFpbmVyLilcbiAgICAqXG4gICAgKiBBIHJlbW90ZSB0ZW1wbGF0ZSBjYW4gYWxzbyBiZSB1c2VkIHRvIHByb21vdGUgbWVzc2FnZSByZXVzYWJpbGl0eSBhbmQgbWVzc2FnZXMgY2FuIGFsc28gYmVcbiAgICAqIG92ZXJyaWRkZW4uXG4gICAgKlxuICAgICoge0BsaW5rIG1vZHVsZTpuZ01lc3NhZ2VzIENsaWNrIGhlcmV9IHRvIGxlYXJuIG1vcmUgYWJvdXQgYG5nTWVzc2FnZXNgIGFuZCBgbmdNZXNzYWdlYC5cbiAgICAqXG4gICAgKiBAdXNhZ2VcbiAgICAqIGBgYGh0bWxcbiAgICAqIDwhLS0gdXNpbmcgYXR0cmlidXRlIGRpcmVjdGl2ZXMgLS0+XG4gICAgKiA8QU5ZIG5nLW1lc3NhZ2VzPVwiZXhwcmVzc2lvblwiIHJvbGU9XCJhbGVydFwiPlxuICAgICogICA8QU5ZIG5nLW1lc3NhZ2U9XCJzdHJpbmdWYWx1ZVwiPi4uLjwvQU5ZPlxuICAgICogICA8QU5ZIG5nLW1lc3NhZ2U9XCJzdHJpbmdWYWx1ZTEsIHN0cmluZ1ZhbHVlMiwgLi4uXCI+Li4uPC9BTlk+XG4gICAgKiAgIDxBTlkgbmctbWVzc2FnZS1leHA9XCJleHByZXNzaW9uVmFsdWVcIj4uLi48L0FOWT5cbiAgICAqIDwvQU5ZPlxuICAgICpcbiAgICAqIDwhLS0gb3IgYnkgdXNpbmcgZWxlbWVudCBkaXJlY3RpdmVzIC0tPlxuICAgICogPG5nLW1lc3NhZ2VzIGZvcj1cImV4cHJlc3Npb25cIiByb2xlPVwiYWxlcnRcIj5cbiAgICAqICAgPG5nLW1lc3NhZ2Ugd2hlbj1cInN0cmluZ1ZhbHVlXCI+Li4uPC9uZy1tZXNzYWdlPlxuICAgICogICA8bmctbWVzc2FnZSB3aGVuPVwic3RyaW5nVmFsdWUxLCBzdHJpbmdWYWx1ZTIsIC4uLlwiPi4uLjwvbmctbWVzc2FnZT5cbiAgICAqICAgPG5nLW1lc3NhZ2Ugd2hlbi1leHA9XCJleHByZXNzaW9uVmFsdWVcIj4uLi48L25nLW1lc3NhZ2U+XG4gICAgKiA8L25nLW1lc3NhZ2VzPlxuICAgICogYGBgXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5nTWVzc2FnZXMgYW4gYW5ndWxhciBleHByZXNzaW9uIGV2YWx1YXRpbmcgdG8gYSBrZXkvdmFsdWUgb2JqZWN0XG4gICAgKiAgICAgICAgICAgICAgICAgKHRoaXMgaXMgdHlwaWNhbGx5IHRoZSAkZXJyb3Igb2JqZWN0IG9uIGFuIG5nTW9kZWwgaW5zdGFuY2UpLlxuICAgICogQHBhcmFtIHtzdHJpbmc9fSBuZ01lc3NhZ2VzTXVsdGlwbGV8bXVsdGlwbGUgd2hlbiBzZXQsIGFsbCBtZXNzYWdlcyB3aWxsIGJlIGRpc3BsYXllZCB3aXRoIHRydWVcbiAgICAqXG4gICAgKiBAZXhhbXBsZVxuICAgICogPGV4YW1wbGUgbmFtZT1cIm5nTWVzc2FnZXMtZGlyZWN0aXZlXCIgbW9kdWxlPVwibmdNZXNzYWdlc0V4YW1wbGVcIlxuICAgICogICAgICAgICAgZGVwcz1cImFuZ3VsYXItbWVzc2FnZXMuanNcIlxuICAgICogICAgICAgICAgYW5pbWF0aW9ucz1cInRydWVcIiBmaXhCYXNlPVwidHJ1ZVwiPlxuICAgICogICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxuICAgICogICAgIDxmb3JtIG5hbWU9XCJteUZvcm1cIj5cbiAgICAqICAgICAgIDxsYWJlbD5cbiAgICAqICAgICAgICAgRW50ZXIgeW91ciBuYW1lOlxuICAgICogICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIlxuICAgICogICAgICAgICAgICAgICAgbmFtZT1cIm15TmFtZVwiXG4gICAgKiAgICAgICAgICAgICAgICBuZy1tb2RlbD1cIm5hbWVcIlxuICAgICogICAgICAgICAgICAgICAgbmctbWlubGVuZ3RoPVwiNVwiXG4gICAgKiAgICAgICAgICAgICAgICBuZy1tYXhsZW5ndGg9XCIyMFwiXG4gICAgKiAgICAgICAgICAgICAgICByZXF1aXJlZCAvPlxuICAgICogICAgICAgPC9sYWJlbD5cbiAgICAqICAgICAgIDxwcmU+bXlGb3JtLm15TmFtZS4kZXJyb3IgPSB7eyBteUZvcm0ubXlOYW1lLiRlcnJvciB8IGpzb24gfX08L3ByZT5cbiAgICAqXG4gICAgKiAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzPVwibXlGb3JtLm15TmFtZS4kZXJyb3JcIiBzdHlsZT1cImNvbG9yOm1hcm9vblwiIHJvbGU9XCJhbGVydFwiPlxuICAgICogICAgICAgICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPllvdSBkaWQgbm90IGVudGVyIGEgZmllbGQ8L2Rpdj5cbiAgICAqICAgICAgICAgPGRpdiBuZy1tZXNzYWdlPVwibWlubGVuZ3RoXCI+WW91ciBmaWVsZCBpcyB0b28gc2hvcnQ8L2Rpdj5cbiAgICAqICAgICAgICAgPGRpdiBuZy1tZXNzYWdlPVwibWF4bGVuZ3RoXCI+WW91ciBmaWVsZCBpcyB0b28gbG9uZzwvZGl2PlxuICAgICogICAgICAgPC9kaXY+XG4gICAgKiAgICAgPC9mb3JtPlxuICAgICogICA8L2ZpbGU+XG4gICAgKiAgIDxmaWxlIG5hbWU9XCJzY3JpcHQuanNcIj5cbiAgICAqICAgICBhbmd1bGFyLm1vZHVsZSgnbmdNZXNzYWdlc0V4YW1wbGUnLCBbJ25nTWVzc2FnZXMnXSk7XG4gICAgKiAgIDwvZmlsZT5cbiAgICAqIDwvZXhhbXBsZT5cbiAgICAqL1xuICAgLmRpcmVjdGl2ZSgnbmdNZXNzYWdlcycsIFsnJGFuaW1hdGUnLCBmdW5jdGlvbigkYW5pbWF0ZSkge1xuICAgICB2YXIgQUNUSVZFX0NMQVNTID0gJ25nLWFjdGl2ZSc7XG4gICAgIHZhciBJTkFDVElWRV9DTEFTUyA9ICduZy1pbmFjdGl2ZSc7XG5cbiAgICAgcmV0dXJuIHtcbiAgICAgICByZXF1aXJlOiAnbmdNZXNzYWdlcycsXG4gICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsICckc2NvcGUnLCAnJGF0dHJzJywgZnVuY3Rpb24oJGVsZW1lbnQsICRzY29wZSwgJGF0dHJzKSB7XG4gICAgICAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgICAgICB2YXIgbGF0ZXN0S2V5ID0gMDtcbiAgICAgICAgIHZhciBuZXh0QXR0YWNoSWQgPSAwO1xuXG4gICAgICAgICB0aGlzLmdldEF0dGFjaElkID0gZnVuY3Rpb24gZ2V0QXR0YWNoSWQoKSB7IHJldHVybiBuZXh0QXR0YWNoSWQrKzsgfTtcblxuICAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcyA9IHt9O1xuICAgICAgICAgdmFyIHJlbmRlckxhdGVyLCBjYWNoZWRDb2xsZWN0aW9uO1xuXG4gICAgICAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb24gfHwge307XG5cbiAgICAgICAgICAgcmVuZGVyTGF0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgY2FjaGVkQ29sbGVjdGlvbiA9IGNvbGxlY3Rpb247XG5cbiAgICAgICAgICAgLy8gdGhpcyBpcyB0cnVlIGlmIHRoZSBhdHRyaWJ1dGUgaXMgZW1wdHkgb3IgaWYgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBpcyB0cnV0aHlcbiAgICAgICAgICAgdmFyIG11bHRpcGxlID0gaXNBdHRyVHJ1dGh5KCRzY29wZSwgJGF0dHJzLm5nTWVzc2FnZXNNdWx0aXBsZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBdHRyVHJ1dGh5KCRzY29wZSwgJGF0dHJzLm11bHRpcGxlKTtcblxuICAgICAgICAgICB2YXIgdW5tYXRjaGVkTWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICAgdmFyIG1hdGNoZWRLZXlzID0ge307XG4gICAgICAgICAgIHZhciBtZXNzYWdlSXRlbSA9IGN0cmwuaGVhZDtcbiAgICAgICAgICAgdmFyIG1lc3NhZ2VGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICB2YXIgdG90YWxNZXNzYWdlcyA9IDA7XG5cbiAgICAgICAgICAgLy8gd2UgdXNlICE9IGluc3RlYWQgb2YgIT09IHRvIGFsbG93IGZvciBib3RoIHVuZGVmaW5lZCBhbmQgbnVsbCB2YWx1ZXNcbiAgICAgICAgICAgd2hpbGUgKG1lc3NhZ2VJdGVtICE9IG51bGwpIHtcbiAgICAgICAgICAgICB0b3RhbE1lc3NhZ2VzKys7XG4gICAgICAgICAgICAgdmFyIG1lc3NhZ2VDdHJsID0gbWVzc2FnZUl0ZW0ubWVzc2FnZTtcblxuICAgICAgICAgICAgIHZhciBtZXNzYWdlVXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgIGlmICghbWVzc2FnZUZvdW5kKSB7XG4gICAgICAgICAgICAgICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgaWYgKCFtZXNzYWdlVXNlZCAmJiB0cnV0aHkodmFsdWUpICYmIG1lc3NhZ2VDdHJsLnRlc3Qoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgdG8gcHJldmVudCB0aGUgc2FtZSBlcnJvciBuYW1lIGZyb20gc2hvd2luZyB1cCB0d2ljZVxuICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGVkS2V5c1trZXldKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgbWF0Y2hlZEtleXNba2V5XSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlVXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZUN0cmwuYXR0YWNoKCk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIGlmIChtZXNzYWdlVXNlZCkge1xuICAgICAgICAgICAgICAgLy8gdW5sZXNzIHdlIHdhbnQgdG8gZGlzcGxheSBtdWx0aXBsZSBtZXNzYWdlcyB0aGVuIHdlIHNob3VsZFxuICAgICAgICAgICAgICAgLy8gc2V0IGEgZmxhZyBoZXJlIHRvIGF2b2lkIGRpc3BsYXlpbmcgdGhlIG5leHQgbWVzc2FnZSBpbiB0aGUgbGlzdFxuICAgICAgICAgICAgICAgbWVzc2FnZUZvdW5kID0gIW11bHRpcGxlO1xuICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICB1bm1hdGNoZWRNZXNzYWdlcy5wdXNoKG1lc3NhZ2VDdHJsKTtcbiAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICBtZXNzYWdlSXRlbSA9IG1lc3NhZ2VJdGVtLm5leHQ7XG4gICAgICAgICAgIH1cblxuICAgICAgICAgICBmb3JFYWNoKHVubWF0Y2hlZE1lc3NhZ2VzLCBmdW5jdGlvbihtZXNzYWdlQ3RybCkge1xuICAgICAgICAgICAgIG1lc3NhZ2VDdHJsLmRldGFjaCgpO1xuICAgICAgICAgICB9KTtcblxuICAgICAgICAgICB1bm1hdGNoZWRNZXNzYWdlcy5sZW5ndGggIT09IHRvdGFsTWVzc2FnZXNcbiAgICAgICAgICAgICAgPyAkYW5pbWF0ZS5zZXRDbGFzcygkZWxlbWVudCwgQUNUSVZFX0NMQVNTLCBJTkFDVElWRV9DTEFTUylcbiAgICAgICAgICAgICAgOiAkYW5pbWF0ZS5zZXRDbGFzcygkZWxlbWVudCwgSU5BQ1RJVkVfQ0xBU1MsIEFDVElWRV9DTEFTUyk7XG4gICAgICAgICB9O1xuXG4gICAgICAgICAkc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigkYXR0cnMubmdNZXNzYWdlcyB8fCAkYXR0cnNbJ2ZvciddLCBjdHJsLnJlbmRlcik7XG5cbiAgICAgICAgIHRoaXMucmVSZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgaWYgKCFyZW5kZXJMYXRlcikge1xuICAgICAgICAgICAgIHJlbmRlckxhdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAkc2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgIGlmIChyZW5kZXJMYXRlcikge1xuICAgICAgICAgICAgICAgICBjYWNoZWRDb2xsZWN0aW9uICYmIGN0cmwucmVuZGVyKGNhY2hlZENvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuXG4gICAgICAgICB0aGlzLnJlZ2lzdGVyID0gZnVuY3Rpb24oY29tbWVudCwgbWVzc2FnZUN0cmwpIHtcbiAgICAgICAgICAgdmFyIG5leHRLZXkgPSBsYXRlc3RLZXkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgbWVzc2FnZXNbbmV4dEtleV0gPSB7XG4gICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZUN0cmxcbiAgICAgICAgICAgfTtcbiAgICAgICAgICAgaW5zZXJ0TWVzc2FnZU5vZGUoJGVsZW1lbnRbMF0sIGNvbW1lbnQsIG5leHRLZXkpO1xuICAgICAgICAgICBjb21tZW50LiQkbmdNZXNzYWdlTm9kZSA9IG5leHRLZXk7XG4gICAgICAgICAgIGxhdGVzdEtleSsrO1xuXG4gICAgICAgICAgIGN0cmwucmVSZW5kZXIoKTtcbiAgICAgICAgIH07XG5cbiAgICAgICAgIHRoaXMuZGVyZWdpc3RlciA9IGZ1bmN0aW9uKGNvbW1lbnQpIHtcbiAgICAgICAgICAgdmFyIGtleSA9IGNvbW1lbnQuJCRuZ01lc3NhZ2VOb2RlO1xuICAgICAgICAgICBkZWxldGUgY29tbWVudC4kJG5nTWVzc2FnZU5vZGU7XG4gICAgICAgICAgIHJlbW92ZU1lc3NhZ2VOb2RlKCRlbGVtZW50WzBdLCBjb21tZW50LCBrZXkpO1xuICAgICAgICAgICBkZWxldGUgbWVzc2FnZXNba2V5XTtcbiAgICAgICAgICAgY3RybC5yZVJlbmRlcigpO1xuICAgICAgICAgfTtcblxuICAgICAgICAgZnVuY3Rpb24gZmluZFByZXZpb3VzTWVzc2FnZShwYXJlbnQsIGNvbW1lbnQpIHtcbiAgICAgICAgICAgdmFyIHByZXZOb2RlID0gY29tbWVudDtcbiAgICAgICAgICAgdmFyIHBhcmVudExvb2t1cCA9IFtdO1xuICAgICAgICAgICB3aGlsZSAocHJldk5vZGUgJiYgcHJldk5vZGUgIT09IHBhcmVudCkge1xuICAgICAgICAgICAgIHZhciBwcmV2S2V5ID0gcHJldk5vZGUuJCRuZ01lc3NhZ2VOb2RlO1xuICAgICAgICAgICAgIGlmIChwcmV2S2V5ICYmIHByZXZLZXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZXNbcHJldktleV07XG4gICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgLy8gZGl2ZSBkZWVwZXIgaW50byB0aGUgRE9NIGFuZCBleGFtaW5lIGl0cyBjaGlsZHJlbiBmb3IgYW55IG5nTWVzc2FnZVxuICAgICAgICAgICAgIC8vIGNvbW1lbnRzIHRoYXQgbWF5IGJlIGluIGFuIGVsZW1lbnQgdGhhdCBhcHBlYXJzIGRlZXBlciBpbiB0aGUgbGlzdFxuICAgICAgICAgICAgIGlmIChwcmV2Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aCAmJiBwYXJlbnRMb29rdXAuaW5kZXhPZihwcmV2Tm9kZSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgIHBhcmVudExvb2t1cC5wdXNoKHByZXZOb2RlKTtcbiAgICAgICAgICAgICAgIHByZXZOb2RlID0gcHJldk5vZGUuY2hpbGROb2Rlc1twcmV2Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICBwcmV2Tm9kZSA9IHByZXZOb2RlLnByZXZpb3VzU2libGluZyB8fCBwcmV2Tm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfVxuICAgICAgICAgfVxuXG4gICAgICAgICBmdW5jdGlvbiBpbnNlcnRNZXNzYWdlTm9kZShwYXJlbnQsIGNvbW1lbnQsIGtleSkge1xuICAgICAgICAgICB2YXIgbWVzc2FnZU5vZGUgPSBtZXNzYWdlc1trZXldO1xuICAgICAgICAgICBpZiAoIWN0cmwuaGVhZCkge1xuICAgICAgICAgICAgIGN0cmwuaGVhZCA9IG1lc3NhZ2VOb2RlO1xuICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIHZhciBtYXRjaCA9IGZpbmRQcmV2aW91c01lc3NhZ2UocGFyZW50LCBjb21tZW50KTtcbiAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgIG1lc3NhZ2VOb2RlLm5leHQgPSBtYXRjaC5uZXh0O1xuICAgICAgICAgICAgICAgbWF0Y2gubmV4dCA9IG1lc3NhZ2VOb2RlO1xuICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICBtZXNzYWdlTm9kZS5uZXh0ID0gY3RybC5oZWFkO1xuICAgICAgICAgICAgICAgY3RybC5oZWFkID0gbWVzc2FnZU5vZGU7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIHJlbW92ZU1lc3NhZ2VOb2RlKHBhcmVudCwgY29tbWVudCwga2V5KSB7XG4gICAgICAgICAgIHZhciBtZXNzYWdlTm9kZSA9IG1lc3NhZ2VzW2tleV07XG5cbiAgICAgICAgICAgdmFyIG1hdGNoID0gZmluZFByZXZpb3VzTWVzc2FnZShwYXJlbnQsIGNvbW1lbnQpO1xuICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICBtYXRjaC5uZXh0ID0gbWVzc2FnZU5vZGUubmV4dDtcbiAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICBjdHJsLmhlYWQgPSBtZXNzYWdlTm9kZS5uZXh0O1xuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgfV1cbiAgICAgfTtcblxuICAgICBmdW5jdGlvbiBpc0F0dHJUcnV0aHkoc2NvcGUsIGF0dHIpIHtcbiAgICAgIHJldHVybiAoaXNTdHJpbmcoYXR0cikgJiYgYXR0ci5sZW5ndGggPT09IDApIHx8IC8vZW1wdHkgYXR0cmlidXRlXG4gICAgICAgICAgICAgdHJ1dGh5KHNjb3BlLiRldmFsKGF0dHIpKTtcbiAgICAgfVxuXG4gICAgIGZ1bmN0aW9uIHRydXRoeSh2YWwpIHtcbiAgICAgICByZXR1cm4gaXNTdHJpbmcodmFsKSA/IHZhbC5sZW5ndGggOiAhIXZhbDtcbiAgICAgfVxuICAgfV0pXG5cbiAgIC8qKlxuICAgICogQG5nZG9jIGRpcmVjdGl2ZVxuICAgICogQG5hbWUgbmdNZXNzYWdlc0luY2x1ZGVcbiAgICAqIEByZXN0cmljdCBBRVxuICAgICogQHNjb3BlXG4gICAgKlxuICAgICogQGRlc2NyaXB0aW9uXG4gICAgKiBgbmdNZXNzYWdlc0luY2x1ZGVgIGlzIGEgZGlyZWN0aXZlIHdpdGggdGhlIHB1cnBvc2UgdG8gaW1wb3J0IGV4aXN0aW5nIG5nTWVzc2FnZSB0ZW1wbGF0ZVxuICAgICogY29kZSBmcm9tIGEgcmVtb3RlIHRlbXBsYXRlIGFuZCBwbGFjZSB0aGUgZG93bmxvYWRlZCB0ZW1wbGF0ZSBjb2RlIGludG8gdGhlIGV4YWN0IHNwb3RcbiAgICAqIHRoYXQgdGhlIG5nTWVzc2FnZXNJbmNsdWRlIGRpcmVjdGl2ZSBpcyBwbGFjZWQgd2l0aGluIHRoZSBuZ01lc3NhZ2VzIGNvbnRhaW5lci4gVGhpcyBhbGxvd3NcbiAgICAqIGZvciBhIHNlcmllcyBvZiBwcmUtZGVmaW5lZCBtZXNzYWdlcyB0byBiZSByZXVzZWQgYW5kIGFsc28gYWxsb3dzIGZvciB0aGUgZGV2ZWxvcGVyIHRvXG4gICAgKiBkZXRlcm1pbmUgd2hhdCBtZXNzYWdlcyBhcmUgb3ZlcnJpZGRlbiBkdWUgdG8gdGhlIHBsYWNlbWVudCBvZiB0aGUgbmdNZXNzYWdlc0luY2x1ZGUgZGlyZWN0aXZlLlxuICAgICpcbiAgICAqIEB1c2FnZVxuICAgICogYGBgaHRtbFxuICAgICogPCEtLSB1c2luZyBhdHRyaWJ1dGUgZGlyZWN0aXZlcyAtLT5cbiAgICAqIDxBTlkgbmctbWVzc2FnZXM9XCJleHByZXNzaW9uXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgKiAgIDxBTlkgbmctbWVzc2FnZXMtaW5jbHVkZT1cInJlbW90ZVRwbFN0cmluZ1wiPi4uLjwvQU5ZPlxuICAgICogPC9BTlk+XG4gICAgKlxuICAgICogPCEtLSBvciBieSB1c2luZyBlbGVtZW50IGRpcmVjdGl2ZXMgLS0+XG4gICAgKiA8bmctbWVzc2FnZXMgZm9yPVwiZXhwcmVzc2lvblwiIHJvbGU9XCJhbGVydFwiPlxuICAgICogICA8bmctbWVzc2FnZXMtaW5jbHVkZSBzcmM9XCJleHByZXNzaW9uVmFsdWUxXCI+Li4uPC9uZy1tZXNzYWdlcy1pbmNsdWRlPlxuICAgICogPC9uZy1tZXNzYWdlcz5cbiAgICAqIGBgYFxuICAgICpcbiAgICAqIHtAbGluayBtb2R1bGU6bmdNZXNzYWdlcyBDbGljayBoZXJlfSB0byBsZWFybiBtb3JlIGFib3V0IGBuZ01lc3NhZ2VzYCBhbmQgYG5nTWVzc2FnZWAuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5nTWVzc2FnZXNJbmNsdWRlfHNyYyBhIHN0cmluZyB2YWx1ZSBjb3JyZXNwb25kaW5nIHRvIHRoZSByZW1vdGUgdGVtcGxhdGUuXG4gICAgKi9cbiAgIC5kaXJlY3RpdmUoJ25nTWVzc2FnZXNJbmNsdWRlJyxcbiAgICAgWyckdGVtcGxhdGVSZXF1ZXN0JywgJyRkb2N1bWVudCcsICckY29tcGlsZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZVJlcXVlc3QsICRkb2N1bWVudCwgJGNvbXBpbGUpIHtcblxuICAgICByZXR1cm4ge1xuICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgIHJlcXVpcmU6ICdeXm5nTWVzc2FnZXMnLCAvLyB3ZSBvbmx5IHJlcXVpcmUgdGhpcyBmb3IgdmFsaWRhdGlvbiBzYWtlXG4gICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgdmFyIHNyYyA9IGF0dHJzLm5nTWVzc2FnZXNJbmNsdWRlIHx8IGF0dHJzLnNyYztcbiAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Qoc3JjKS50aGVuKGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICAgJGNvbXBpbGUoaHRtbCkoJHNjb3BlLCBmdW5jdGlvbihjb250ZW50cykge1xuICAgICAgICAgICAgIGVsZW1lbnQuYWZ0ZXIoY29udGVudHMpO1xuXG4gICAgICAgICAgICAgLy8gdGhlIGFuY2hvciBpcyBwbGFjZWQgZm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xuICAgICAgICAgICAgIHZhciBhbmNob3IgPSBqcUxpdGUoJGRvY3VtZW50WzBdLmNyZWF0ZUNvbW1lbnQoJyBuZ01lc3NhZ2VzSW5jbHVkZTogJyArIHNyYyArICcgJykpO1xuICAgICAgICAgICAgIGVsZW1lbnQuYWZ0ZXIoYW5jaG9yKTtcblxuICAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gcG9sbHV0ZSB0aGUgRE9NIGFueW1vcmUgYnkga2VlcGluZyBhbiBlbXB0eSBkaXJlY3RpdmUgZWxlbWVudFxuICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgIH0pO1xuICAgICAgICAgfSk7XG4gICAgICAgfVxuICAgICB9O1xuICAgfV0pXG5cbiAgIC8qKlxuICAgICogQG5nZG9jIGRpcmVjdGl2ZVxuICAgICogQG5hbWUgbmdNZXNzYWdlXG4gICAgKiBAcmVzdHJpY3QgQUVcbiAgICAqIEBzY29wZVxuICAgICpcbiAgICAqIEBkZXNjcmlwdGlvblxuICAgICogYG5nTWVzc2FnZWAgaXMgYSBkaXJlY3RpdmUgd2l0aCB0aGUgcHVycG9zZSB0byBzaG93IGFuZCBoaWRlIGEgcGFydGljdWxhciBtZXNzYWdlLlxuICAgICogRm9yIGBuZ01lc3NhZ2VgIHRvIG9wZXJhdGUsIGEgcGFyZW50IGBuZ01lc3NhZ2VzYCBkaXJlY3RpdmUgb24gYSBwYXJlbnQgRE9NIGVsZW1lbnRcbiAgICAqIG11c3QgYmUgc2l0dWF0ZWQgc2luY2UgaXQgZGV0ZXJtaW5lcyB3aGljaCBtZXNzYWdlcyBhcmUgdmlzaWJsZSBiYXNlZCBvbiB0aGUgc3RhdGVcbiAgICAqIG9mIHRoZSBwcm92aWRlZCBrZXkvdmFsdWUgbWFwIHRoYXQgYG5nTWVzc2FnZXNgIGxpc3RlbnMgb24uXG4gICAgKlxuICAgICogTW9yZSBpbmZvcm1hdGlvbiBhYm91dCB1c2luZyBgbmdNZXNzYWdlYCBjYW4gYmUgZm91bmQgaW4gdGhlXG4gICAgKiB7QGxpbmsgbW9kdWxlOm5nTWVzc2FnZXMgYG5nTWVzc2FnZXNgIG1vZHVsZSBkb2N1bWVudGF0aW9ufS5cbiAgICAqXG4gICAgKiBAdXNhZ2VcbiAgICAqIGBgYGh0bWxcbiAgICAqIDwhLS0gdXNpbmcgYXR0cmlidXRlIGRpcmVjdGl2ZXMgLS0+XG4gICAgKiA8QU5ZIG5nLW1lc3NhZ2VzPVwiZXhwcmVzc2lvblwiIHJvbGU9XCJhbGVydFwiPlxuICAgICogICA8QU5ZIG5nLW1lc3NhZ2U9XCJzdHJpbmdWYWx1ZVwiPi4uLjwvQU5ZPlxuICAgICogICA8QU5ZIG5nLW1lc3NhZ2U9XCJzdHJpbmdWYWx1ZTEsIHN0cmluZ1ZhbHVlMiwgLi4uXCI+Li4uPC9BTlk+XG4gICAgKiA8L0FOWT5cbiAgICAqXG4gICAgKiA8IS0tIG9yIGJ5IHVzaW5nIGVsZW1lbnQgZGlyZWN0aXZlcyAtLT5cbiAgICAqIDxuZy1tZXNzYWdlcyBmb3I9XCJleHByZXNzaW9uXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgKiAgIDxuZy1tZXNzYWdlIHdoZW49XCJzdHJpbmdWYWx1ZVwiPi4uLjwvbmctbWVzc2FnZT5cbiAgICAqICAgPG5nLW1lc3NhZ2Ugd2hlbj1cInN0cmluZ1ZhbHVlMSwgc3RyaW5nVmFsdWUyLCAuLi5cIj4uLi48L25nLW1lc3NhZ2U+XG4gICAgKiA8L25nLW1lc3NhZ2VzPlxuICAgICogYGBgXG4gICAgKlxuICAgICogQHBhcmFtIHtleHByZXNzaW9ufSBuZ01lc3NhZ2V8d2hlbiBhIHN0cmluZyB2YWx1ZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtZXNzYWdlIGtleS5cbiAgICAqL1xuICAuZGlyZWN0aXZlKCduZ01lc3NhZ2UnLCBuZ01lc3NhZ2VEaXJlY3RpdmVGYWN0b3J5KCdBRScpKVxuXG5cbiAgIC8qKlxuICAgICogQG5nZG9jIGRpcmVjdGl2ZVxuICAgICogQG5hbWUgbmdNZXNzYWdlRXhwXG4gICAgKiBAcmVzdHJpY3QgQUVcbiAgICAqIEBzY29wZVxuICAgICpcbiAgICAqIEBkZXNjcmlwdGlvblxuICAgICogYG5nTWVzc2FnZUV4cGAgaXMgYSBkaXJlY3RpdmUgd2l0aCB0aGUgcHVycG9zZSB0byBzaG93IGFuZCBoaWRlIGEgcGFydGljdWxhciBtZXNzYWdlLlxuICAgICogRm9yIGBuZ01lc3NhZ2VFeHBgIHRvIG9wZXJhdGUsIGEgcGFyZW50IGBuZ01lc3NhZ2VzYCBkaXJlY3RpdmUgb24gYSBwYXJlbnQgRE9NIGVsZW1lbnRcbiAgICAqIG11c3QgYmUgc2l0dWF0ZWQgc2luY2UgaXQgZGV0ZXJtaW5lcyB3aGljaCBtZXNzYWdlcyBhcmUgdmlzaWJsZSBiYXNlZCBvbiB0aGUgc3RhdGVcbiAgICAqIG9mIHRoZSBwcm92aWRlZCBrZXkvdmFsdWUgbWFwIHRoYXQgYG5nTWVzc2FnZXNgIGxpc3RlbnMgb24uXG4gICAgKlxuICAgICogQHVzYWdlXG4gICAgKiBgYGBodG1sXG4gICAgKiA8IS0tIHVzaW5nIGF0dHJpYnV0ZSBkaXJlY3RpdmVzIC0tPlxuICAgICogPEFOWSBuZy1tZXNzYWdlcz1cImV4cHJlc3Npb25cIj5cbiAgICAqICAgPEFOWSBuZy1tZXNzYWdlLWV4cD1cImV4cHJlc3Npb25WYWx1ZVwiPi4uLjwvQU5ZPlxuICAgICogPC9BTlk+XG4gICAgKlxuICAgICogPCEtLSBvciBieSB1c2luZyBlbGVtZW50IGRpcmVjdGl2ZXMgLS0+XG4gICAgKiA8bmctbWVzc2FnZXMgZm9yPVwiZXhwcmVzc2lvblwiPlxuICAgICogICA8bmctbWVzc2FnZSB3aGVuLWV4cD1cImV4cHJlc3Npb25WYWx1ZVwiPi4uLjwvbmctbWVzc2FnZT5cbiAgICAqIDwvbmctbWVzc2FnZXM+XG4gICAgKiBgYGBcbiAgICAqXG4gICAgKiB7QGxpbmsgbW9kdWxlOm5nTWVzc2FnZXMgQ2xpY2sgaGVyZX0gdG8gbGVhcm4gbW9yZSBhYm91dCBgbmdNZXNzYWdlc2AgYW5kIGBuZ01lc3NhZ2VgLlxuICAgICpcbiAgICAqIEBwYXJhbSB7ZXhwcmVzc2lvbn0gbmdNZXNzYWdlRXhwfHdoZW5FeHAgYW4gZXhwcmVzc2lvbiB2YWx1ZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtZXNzYWdlIGtleS5cbiAgICAqL1xuICAuZGlyZWN0aXZlKCduZ01lc3NhZ2VFeHAnLCBuZ01lc3NhZ2VEaXJlY3RpdmVGYWN0b3J5KCdBJykpO1xuXG5mdW5jdGlvbiBuZ01lc3NhZ2VEaXJlY3RpdmVGYWN0b3J5KHJlc3RyaWN0KSB7XG4gIHJldHVybiBbJyRhbmltYXRlJywgZnVuY3Rpb24oJGFuaW1hdGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICB0cmFuc2NsdWRlOiAnZWxlbWVudCcsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6ICdeXm5nTWVzc2FnZXMnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01lc3NhZ2VzQ3RybCwgJHRyYW5zY2x1ZGUpIHtcbiAgICAgICAgdmFyIGNvbW1lbnROb2RlID0gZWxlbWVudFswXTtcblxuICAgICAgICB2YXIgcmVjb3JkcztcbiAgICAgICAgdmFyIHN0YXRpY0V4cCA9IGF0dHJzLm5nTWVzc2FnZSB8fCBhdHRycy53aGVuO1xuICAgICAgICB2YXIgZHluYW1pY0V4cCA9IGF0dHJzLm5nTWVzc2FnZUV4cCB8fCBhdHRycy53aGVuRXhwO1xuICAgICAgICB2YXIgYXNzaWduUmVjb3JkcyA9IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICAgICAgcmVjb3JkcyA9IGl0ZW1zXG4gICAgICAgICAgICAgID8gKGlzQXJyYXkoaXRlbXMpXG4gICAgICAgICAgICAgICAgICAgID8gaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgOiBpdGVtcy5zcGxpdCgvW1xccyxdKy8pKVxuICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgICAgbmdNZXNzYWdlc0N0cmwucmVSZW5kZXIoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZHluYW1pY0V4cCkge1xuICAgICAgICAgIGFzc2lnblJlY29yZHMoc2NvcGUuJGV2YWwoZHluYW1pY0V4cCkpO1xuICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oZHluYW1pY0V4cCwgYXNzaWduUmVjb3Jkcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXNzaWduUmVjb3JkcyhzdGF0aWNFeHApO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50LCBtZXNzYWdlQ3RybDtcbiAgICAgICAgbmdNZXNzYWdlc0N0cmwucmVnaXN0ZXIoY29tbWVudE5vZGUsIG1lc3NhZ2VDdHJsID0ge1xuICAgICAgICAgIHRlc3Q6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250YWlucyhyZWNvcmRzLCBuYW1lKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGF0dGFjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICR0cmFuc2NsdWRlKHNjb3BlLCBmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihlbG0sIG51bGwsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gZWxtO1xuXG4gICAgICAgICAgICAgICAgLy8gRWFjaCB0aW1lIHdlIGF0dGFjaCB0aGlzIG5vZGUgdG8gYSBtZXNzYWdlIHdlIGdldCBhIG5ldyBpZCB0aGF0IHdlIGNhbiBtYXRjaFxuICAgICAgICAgICAgICAgIC8vIHdoZW4gd2UgYXJlIGRlc3Ryb3lpbmcgdGhlIG5vZGUgbGF0ZXIuXG4gICAgICAgICAgICAgICAgdmFyICQkYXR0YWNoSWQgPSBjdXJyZW50RWxlbWVudC4kJGF0dGFjaElkID0gbmdNZXNzYWdlc0N0cmwuZ2V0QXR0YWNoSWQoKTtcblxuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBwYXJlbnQgZWxlbWVudCBpcyBkZXN0cm95ZWRcbiAgICAgICAgICAgICAgICAvLyBieSBhbnkgb3RoZXIgc3RydWN0dXJhbCBkaXJlY3RpdmUgdGhlbiBpdCdzIHRpbWVcbiAgICAgICAgICAgICAgICAvLyB0byBkZXJlZ2lzdGVyIHRoZSBtZXNzYWdlIGZyb20gdGhlIGNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICBjdXJyZW50RWxlbWVudC5vbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RWxlbWVudCAmJiBjdXJyZW50RWxlbWVudC4kJGF0dGFjaElkID09PSAkJGF0dGFjaElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5nTWVzc2FnZXNDdHJsLmRlcmVnaXN0ZXIoY29tbWVudE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ3RybC5kZXRhY2goKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZXRhY2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgIHZhciBlbG0gPSBjdXJyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgY3VycmVudEVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShlbG0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfV07XG5cbiAgZnVuY3Rpb24gY29udGFpbnMoY29sbGVjdGlvbiwga2V5KSB7XG4gICAgaWYgKGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBpc0FycmF5KGNvbGxlY3Rpb24pXG4gICAgICAgICAgPyBjb2xsZWN0aW9uLmluZGV4T2Yoa2V5KSA+PSAwXG4gICAgICAgICAgOiBjb2xsZWN0aW9uLmhhc093blByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG5cblxufSkod2luZG93LCB3aW5kb3cuYW5ndWxhcik7XG4iLCJyZXF1aXJlKCcuL2FuZ3VsYXItbWVzc2FnZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gJ25nTWVzc2FnZXMnO1xuIiwiOyB2YXIgX19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLypcbiAqIGlvbi1hdXRvY29tcGxldGUgMC4zLjBcbiAqIENvcHlyaWdodCAyMDE1IERhbm55IFBvdm9sb3Rza2lcbiAqIENvcHlyaWdodCBtb2RpZmljYXRpb25zIDIwMTUgR3V5IEJyYW5kXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ3V5bGFicy9pb24tYXV0b2NvbXBsZXRlXG4gKi9cbihmdW5jdGlvbigpIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnaW9uLWF1dG9jb21wbGV0ZScsIFtdKS5kaXJlY3RpdmUoJ2lvbkF1dG9jb21wbGV0ZScsIFtcbiAgICAnJGlvbmljQmFja2Ryb3AnLCAnJGlvbmljU2Nyb2xsRGVsZWdhdGUnLCAnJGRvY3VtZW50JywgJyRxJywgJyRwYXJzZScsICckaW50ZXJwb2xhdGUnLCAnJGlvbmljUGxhdGZvcm0nLCAnJGNvbXBpbGUnLCAnJHRlbXBsYXRlUmVxdWVzdCcsXG4gICAgZnVuY3Rpb24gKCRpb25pY0JhY2tkcm9wLCAkaW9uaWNTY3JvbGxEZWxlZ2F0ZSwgJGRvY3VtZW50LCAkcSwgJHBhcnNlLCAkaW50ZXJwb2xhdGUsICRpb25pY1BsYXRmb3JtLCAkY29tcGlsZSwgJHRlbXBsYXRlUmVxdWVzdCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVxdWlyZTogWyduZ01vZGVsJywgJ2lvbkF1dG9jb21wbGV0ZSddLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHtcbiAgICAgICAgICAgICAgICBuZ01vZGVsOiAnPScsXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxNb2RlbDogJz0nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YTogJz0nLFxuICAgICAgICAgICAgICAgIGl0ZW1zTWV0aG9kOiAnJicsXG4gICAgICAgICAgICAgICAgaXRlbXNDbGlja2VkTWV0aG9kOiAnJicsXG4gICAgICAgICAgICAgICAgaXRlbXNSZW1vdmVkTWV0aG9kOiAnJicsXG4gICAgICAgICAgICAgICAgbW9kZWxUb0l0ZW1NZXRob2Q6ICcmJyxcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25DbGlja2VkTWV0aG9kOiAnJicsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdAJyxcbiAgICAgICAgICAgICAgICBjYW5jZWxMYWJlbDogJ0AnLFxuICAgICAgICAgICAgICAgIHNlbGVjdEl0ZW1zTGFiZWw6ICdAJyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW1zTGFiZWw6ICdAJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZpZXdNb2RlbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiBbJyRhdHRycycsICckdGltZW91dCcsICckc2NvcGUnLCBmdW5jdGlvbiAoJGF0dHJzLCAkdGltZW91dCwgJHNjb3BlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVPckRlZmF1bHQgPSBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXZhbHVlID8gZGVmYXVsdFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gdGhpcztcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCB2YWx1ZXMgb2YgdGhlIG9uZSB3YXkgYmluZGVkIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIucGxhY2Vob2xkZXIgPSB2YWx1ZU9yRGVmYXVsdChjb250cm9sbGVyLnBsYWNlaG9sZGVyLCAnQ2xpY2sgdG8gZW50ZXIgYSB2YWx1ZS4uLicpO1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmNhbmNlbExhYmVsID0gdmFsdWVPckRlZmF1bHQoY29udHJvbGxlci5jYW5jZWxMYWJlbCwgJ0RvbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5zZWxlY3RJdGVtc0xhYmVsID0gdmFsdWVPckRlZmF1bHQoY29udHJvbGxlci5zZWxlY3RJdGVtc0xhYmVsLCBcIlNlbGVjdCBhbiBpdGVtLi4uXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLnNlbGVjdGVkSXRlbXNMYWJlbCA9IHZhbHVlT3JEZWZhdWx0KGNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtc0xhYmVsLCAkaW50ZXJwb2xhdGUoXCJTZWxlY3RlZCBpdGVtc3t7bWF4U2VsZWN0ZWRJdGVtcyA/ICcgKG1heC4gJyArIG1heFNlbGVjdGVkSXRlbXMgKyAnKScgOiAnJ319OlwiKShjb250cm9sbGVyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGRlZmF1bHQgdmFsdWVzIG9mIHRoZSBwYXNzZWQgaW4gYXR0cmlidXRlc1xuICAgICAgICAgICAgICAgIHRoaXMubWF4U2VsZWN0ZWRJdGVtcyA9IHZhbHVlT3JEZWZhdWx0KCRhdHRycy5tYXhTZWxlY3RlZEl0ZW1zLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGVVcmwgPSB2YWx1ZU9yRGVmYXVsdCgkYXR0cnMudGVtcGxhdGVVcmwsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc01ldGhvZFZhbHVlS2V5ID0gdmFsdWVPckRlZmF1bHQoJGF0dHJzLml0ZW1zTWV0aG9kVmFsdWVLZXksIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtVmFsdWVLZXkgPSB2YWx1ZU9yRGVmYXVsdCgkYXR0cnMuaXRlbVZhbHVlS2V5LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbVZpZXdWYWx1ZUtleSA9IHZhbHVlT3JEZWZhdWx0KCRhdHRycy5pdGVtVmlld1ZhbHVlS2V5LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50SWQgPSB2YWx1ZU9yRGVmYXVsdCgkYXR0cnMuY29tcG9uZW50SWQsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSWNvbiA9IHZhbHVlT3JEZWZhdWx0KCRhdHRycy5sb2FkaW5nSWNvbiwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hbmFnZUV4dGVybmFsbHkgPSB2YWx1ZU9yRGVmYXVsdCgkYXR0cnMubWFuYWdlRXh0ZXJuYWxseSwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5nTW9kZWxPcHRpb25zID0gdmFsdWVPckRlZmF1bHQoJHNjb3BlLiRldmFsKCRhdHRycy5uZ01vZGVsT3B0aW9ucyksIHt9KTtcblxuICAgICAgICAgICAgICAgIC8vIGxvYWRpbmcgZmxhZyBpZiB0aGUgaXRlbXMtbWV0aG9kIGlzIGEgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMb2FkaW5nSWNvbiA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gdGhlIGl0ZW1zLCBzZWxlY3RlZCBpdGVtcyBhbmQgdGhlIHF1ZXJ5IGZvciB0aGUgbGlzdFxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaFF1ZXJ5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb250cm9sbGVycykge1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSB0d28gbmVlZGVkIGNvbnRyb2xsZXJzXG4gICAgICAgICAgICAgICAgdmFyIG5nTW9kZWxDb250cm9sbGVyID0gY29udHJvbGxlcnNbMF07XG4gICAgICAgICAgICAgICAgdmFyIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sxXTtcblxuICAgICAgICAgICAgICAgIC8vIHVzZSBhIHJhbmRvbSBjc3MgY2xhc3MgdG8gYmluZCB0aGUgbW9kYWwgdG8gdGhlIGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIucmFuZG9tQ3NzQ2xhc3MgPSBcImlvbi1hdXRvY29tcGxldGUtcmFuZG9tLVwiICsgTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDEwMDApICsgMSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW9uLWF1dG9jb21wbGV0ZS1jb250YWluZXIgJyArIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIucmFuZG9tQ3NzQ2xhc3MgKyAnIG1vZGFsXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPicsXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYmFyIGJhci1oZWFkZXIgaXRlbS1pbnB1dC1pbnNldFwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWwgY2xhc3M9XCJpdGVtLWlucHV0LXdyYXBwZXJcIj4nLFxuICAgICAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJpY29uIGlvbi1zZWFyY2ggcGxhY2Vob2xkZXItaWNvblwiPjwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJzZWFyY2hcIiBjbGFzcz1cImlvbi1hdXRvY29tcGxldGUtc2VhcmNoXCIgbmctbW9kZWw9XCJ2aWV3TW9kZWwuc2VhcmNoUXVlcnlcIiBuZy1tb2RlbC1vcHRpb25zPVwidmlld01vZGVsLm5nTW9kZWxPcHRpb25zXCIgcGxhY2Vob2xkZXI9XCJ7e3ZpZXdNb2RlbC5wbGFjZWhvbGRlcn19XCIvPicsXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW9uLWF1dG9jb21wbGV0ZS1sb2FkaW5nLWljb25cIiBuZy1pZj1cInZpZXdNb2RlbC5zaG93TG9hZGluZ0ljb24gJiYgdmlld01vZGVsLmxvYWRpbmdJY29uXCI+PGlvbi1zcGlubmVyIGljb249XCJ7e3ZpZXdNb2RlbC5sb2FkaW5nSWNvbn19XCI+PC9pb24tc3Bpbm5lcj48L2Rpdj4nLFxuICAgICAgICAgICAgICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cImlvbi1hdXRvY29tcGxldGUtY2FuY2VsIGJ1dHRvbiBidXR0b24tY2xlYXJcIiBuZy1jbGljaz1cInZpZXdNb2RlbC5jYW5jZWxDbGljaygpXCI+e3t2aWV3TW9kZWwuY2FuY2VsTGFiZWx9fTwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nLFxuICAgICAgICAgICAgICAgICAgICAnPGlvbi1jb250ZW50IGNsYXNzPVwiaGFzLWhlYWRlclwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8aW9uLWl0ZW0gY2xhc3M9XCJpdGVtLWRpdmlkZXJcIiBuZy1zaG93PVwidmlld01vZGVsLnNlbGVjdGVkSXRlbXMubGVuZ3RoID4gMFwiPnt7dmlld01vZGVsLnNlbGVjdGVkSXRlbXNMYWJlbH19PC9pb24taXRlbT4nLFxuICAgICAgICAgICAgICAgICAgICAnPGlvbi1pdGVtIG5nLXJlcGVhdD1cInNlbGVjdGVkSXRlbSBpbiB2aWV3TW9kZWwuc2VsZWN0ZWRJdGVtcyB0cmFjayBieSAkaW5kZXhcIiBjbGFzcz1cIml0ZW0taWNvbi1sZWZ0IGl0ZW0taWNvbi1yaWdodCBpdGVtLXRleHQtd3JhcFwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImljb24gaW9uLWNoZWNrbWFya1wiPjwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAne3t2aWV3TW9kZWwuZ2V0SXRlbVZhbHVlKHNlbGVjdGVkSXRlbSwgdmlld01vZGVsLml0ZW1WaWV3VmFsdWVLZXkpfX0nLFxuICAgICAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJpY29uIGlvbi10cmFzaC1hXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlclwiIG5nLWNsaWNrPVwidmlld01vZGVsLnJlbW92ZUl0ZW0oJGluZGV4KVwiPjwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAnPC9pb24taXRlbT4nLFxuICAgICAgICAgICAgICAgICAgICAnPGlvbi1pdGVtIGNsYXNzPVwiaXRlbS1kaXZpZGVyXCIgbmctc2hvdz1cInZpZXdNb2RlbC5zZWFyY2hJdGVtcy5sZW5ndGggPiAwXCI+e3t2aWV3TW9kZWwuc2VsZWN0SXRlbXNMYWJlbH19PC9pb24taXRlbT4nLFxuICAgICAgICAgICAgICAgICAgICAnPGlvbi1pdGVtIGNvbGxlY3Rpb24tcmVwZWF0PVwiaXRlbSBpbiB2aWV3TW9kZWwuc2VhcmNoSXRlbXNcIiBpdGVtLWhlaWdodD1cIjU1cHhcIiBpdGVtLXdpZHRoPVwiMTAwJVwiIG5nLWNsaWNrPVwidmlld01vZGVsLnNlbGVjdEl0ZW0oaXRlbSlcIiBjbGFzcz1cIml0ZW0tdGV4dC13cmFwXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgJ3t7dmlld01vZGVsLmdldEl0ZW1WYWx1ZShpdGVtLCB2aWV3TW9kZWwuaXRlbVZpZXdWYWx1ZUtleSl9fScsXG4gICAgICAgICAgICAgICAgICAgICc8L2lvbi1pdGVtPicsXG4gICAgICAgICAgICAgICAgICAgICc8L2lvbi1jb250ZW50PicsXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKTtcblxuICAgICAgICAgICAgICAgIC8vIGxvYWQgdGhlIHRlbXBsYXRlIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHlcbiAgICAgICAgICAgICAgICAkcS53aGVuKCkudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgY2hlY2sgaWYgYSB0ZW1wbGF0ZSB1cmwgaXMgc2V0IGFuZCB1c2UgdGhpcyBhcyB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci50ZW1wbGF0ZVVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICR0ZW1wbGF0ZVJlcXVlc3QoaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci50ZW1wbGF0ZVVybCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbXBpbGUgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWFyY2hJbnB1dEVsZW1lbnQgPSAkY29tcGlsZShhbmd1bGFyLmVsZW1lbnQodGVtcGxhdGUpKShzY29wZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYXBwZW5kIHRoZSB0ZW1wbGF0ZSB0byBib2R5XG4gICAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5maW5kKCdib2R5JykuYXBwZW5kKHNlYXJjaElucHV0RWxlbWVudCk7XG5cblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuZ2V0SXRlbVZhbHVlID0gZnVuY3Rpb24gKGl0ZW0sIGtleSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFycmF5LCBnbyB0aHJvdWdoIGFsbCBpdGVtcyBhbmQgYWRkIHRoZSB2YWx1ZXMgdG8gYSBuZXcgYXJyYXkgYW5kIHJldHVybiBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtLCBmdW5jdGlvbiAoaXRlbVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgJiYgYW5ndWxhci5pc09iamVjdChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaCgkcGFyc2Uoa2V5KShpdGVtVmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSAmJiBhbmd1bGFyLmlzT2JqZWN0KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkcGFyc2Uoa2V5KShpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiB3aGljaCBzZWxlY3RzIHRoZSBpdGVtLCBoaWRlcyB0aGUgc2VhcmNoIGNvbnRhaW5lciBhbmQgdGhlIGlvbmljIGJhY2tkcm9wIGlmIGl0IGhhcyBub3QgbWF4aW11bSBzZWxlY3RlZCBpdGVtcyBhdHRyaWJ1dGUgc2V0XG4gICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0SXRlbSA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBzZWFyY2ggcXVlcnkgd2hlbiBhbiBpdGVtIGlzIHNlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlYXJjaFF1ZXJ5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gaWYgdGhlIG1heCBzZWxlY3RlZCBpdGVtcyBpcyBub3QgZXF1YWwgdG8gMSBhbmQgdGhlIG1heGltdW0gYW1vdW50IG9mIHNlbGVjdGVkIGl0ZW1zIGlzIHJlYWNoZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpb25BdXRvY29tcGxldGVDb250cm9sbGVyLm1heFNlbGVjdGVkSXRlbXMgIT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLm1heFNlbGVjdGVkSXRlbXMgPT0gaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHNlbGVjdGVkIGl0ZW1zXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzS2V5VmFsdWVJbk9iamVjdEFycmF5KGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5pdGVtVmFsdWVLZXksIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuZ2V0SXRlbVZhbHVlKGl0ZW0sIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuaXRlbVZhbHVlS2V5KSkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGlzIGEgc2luZ2xlIHNlbGVjdCBzZXQgdGhlIGl0ZW0gZGlyZWN0bHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5tYXhTZWxlY3RlZEl0ZW1zID09IFwiMVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtcyA9IFtpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgYXJyYXkgdG8gdXBkYXRlIHRoZSBtb2RlbC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXNlbGVjdC9pc3N1ZXMvMTkxI2lzc3VlY29tbWVudC01NTQ3MTczMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlbGVjdGVkSXRlbXMgPSBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlbGVjdGVkSXRlbXMuY29uY2F0KFtpdGVtXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHZpZXcgdmFsdWUgYW5kIHJlbmRlciBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbENvbnRyb2xsZXIuJHNldFZpZXdWYWx1ZShpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbENvbnRyb2xsZXIuJHJlbmRlcigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSBjb250YWluZXIgYW5kIHRoZSBpb25pYyBiYWNrZHJvcCBpZiBpdCBpcyBhIHNpbmdsZSBzZWxlY3QgdG8gZW5oYW5jZSB1c2FiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpb25BdXRvY29tcGxldGVDb250cm9sbGVyLm1heFNlbGVjdGVkSXRlbXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuaGlkZU1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgaXRlbXMgY2xpY2tlZCBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLml0ZW1zQ2xpY2tlZE1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLml0ZW1zQ2xpY2tlZE1ldGhvZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtczogaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zZWxlY3RlZEl0ZW1zLnNsaWNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZDogaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5jb21wb25lbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZnVuY3Rpb24gd2hpY2ggcmVtb3ZlcyB0aGUgaXRlbSBmcm9tIHRoZSBzZWxlY3RlZCBpdGVtcy5cbiAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5yZW1vdmVJdGVtID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2VsZWN0ZWQgaXRlbXMgYW5kIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIGFycmF5IHRvIHVwZGF0ZSB0aGUgbW9kZWwuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktc2VsZWN0L2lzc3Vlcy8xOTEjaXNzdWVjb21tZW50LTU1NDcxNzMyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlZCA9IGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtcy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zZWxlY3RlZEl0ZW1zID0gaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zZWxlY3RlZEl0ZW1zLnNsaWNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdmlldyB2YWx1ZSBhbmQgcmVuZGVyIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBuZ01vZGVsQ29udHJvbGxlci4kc2V0Vmlld1ZhbHVlKGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZ01vZGVsQ29udHJvbGxlci4kcmVuZGVyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgaXRlbXMgY2xpY2tlZCBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLml0ZW1zUmVtb3ZlZE1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLml0ZW1zUmVtb3ZlZE1ldGhvZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiByZW1vdmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtczogaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zZWxlY3RlZEl0ZW1zLnNsaWNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZDogaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5jb21wb25lbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2F0Y2hlciBvbiB0aGUgc2VhcmNoIGZpZWxkIG1vZGVsIHRvIHVwZGF0ZSB0aGUgbGlzdCBhY2NvcmRpbmcgdG8gdGhlIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgndmlld01vZGVsLnNlYXJjaFF1ZXJ5JywgZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmZldGNoU2VhcmNoUXVlcnkocXVlcnksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBzZWFyY2ggaXRlbXMgYmFzZWQgb24gdGhlIHJldHVybmVkIHZhbHVlIG9mIHRoZSBpdGVtcy1tZXRob2RcbiAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5mZXRjaFNlYXJjaFF1ZXJ5ID0gZnVuY3Rpb24gKHF1ZXJ5LCBpc0luaXRpYWxpemluZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByaWdodCBhd2F5IHJldHVybiBpZiB0aGUgcXVlcnkgaXMgdW5kZWZpbmVkIHRvIG5vdCBjYWxsIHRoZSBpdGVtcyBtZXRob2QgZm9yIG5vdGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMuaXRlbXNNZXRob2QpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaG93IHRoZSBsb2FkaW5nIGljb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNob3dMb2FkaW5nSWNvbiA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnlPYmplY3QgPSB7cXVlcnk6IHF1ZXJ5LCBpc0luaXRpYWxpemluZzogaXNJbml0aWFsaXppbmd9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGNvbXBvbmVudCBpZCBpcyBzZXQsIHRoZW4gYWRkIGl0IHRvIHRoZSBxdWVyeSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5jb21wb25lbnRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeU9iamVjdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5pdGlhbGl6aW5nOiBpc0luaXRpYWxpemluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmNvbXBvbmVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBnaXZlbiBmdW5jdGlvbiB0byBhICRxIHByb21pc2UgdG8gc3VwcG9ydCBwcm9taXNlcyB0b29cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRxLndoZW4oaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5pdGVtc01ldGhvZChxdWVyeU9iamVjdCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChwcm9taXNlRGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBwcm9taXNlIGRhdGEgaXMgbm90IHNldCBkbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcHJvbWlzZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBnaXZlbiBwcm9taXNlIGRhdGEgb2JqZWN0IGhhcyBhIGRhdGEgcHJvcGVydHkgdXNlIHRoaXMgZm9yIHRoZSBmdXJ0aGVyIHByb2Nlc3NpbmcgYXMgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0YW5kYXJkIGh0dHBQcm9taXNlcyBmcm9tIHRoZSAkaHR0cCBmdW5jdGlvbnMgc3RvcmUgdGhlIHJlc3BvbnNlIGRhdGEgaW4gYSBkYXRhIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9taXNlRGF0YSAmJiBwcm9taXNlRGF0YS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlRGF0YSA9IHByb21pc2VEYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGl0ZW1zIHdoaWNoIGFyZSByZXR1cm5lZCBieSB0aGUgaXRlbXMgbWV0aG9kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VhcmNoSXRlbXMgPSBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmdldEl0ZW1WYWx1ZShwcm9taXNlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuaXRlbXNNZXRob2RWYWx1ZUtleSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yY2UgdGhlIGNvbGxlY3Rpb24gcmVwZWF0IHRvIHJlZHJhdyBpdHNlbGYgYXMgdGhlcmUgd2VyZSBpc3N1ZXMgd2hlbiB0aGUgZmlyc3QgaXRlbXMgd2VyZSBhZGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW9uaWNTY3JvbGxEZWxlZ2F0ZS5yZXNpemUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSBsb2FkaW5nIGljb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zaG93TG9hZGluZ0ljb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVqZWN0IHRoZSBlcnJvciBiZWNhdXNlIHdlIGRvIG5vdCBoYW5kbGUgdGhlIGVycm9yIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlYXJjaENvbnRhaW5lckRpc3BsYXllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2hvd01vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlYXJjaENvbnRhaW5lckRpc3BsYXllZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyB0aGUgYmFja2Ryb3AgYW5kIHRoZSBzZWFyY2ggY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW9uaWNCYWNrZHJvcC5yZXRhaW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZG9jdW1lbnRbMF0ucXVlcnlTZWxlY3RvcignZGl2Lmlvbi1hdXRvY29tcGxldGUtY29udGFpbmVyLicgKyBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnJhbmRvbUNzc0NsYXNzKSkuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhpZGUgdGhlIGNvbnRhaW5lciBpZiB0aGUgYmFjayBidXR0b24gaXMgcHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGRlcmVnaXN0ZXJCYWNrQnV0dG9uID0gJGlvbmljUGxhdGZvcm0ucmVnaXN0ZXJCYWNrQnV0dG9uQWN0aW9uKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmhpZGVNb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBjb21waWxlZCBzZWFyY2ggZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWFyY2hJbnB1dEVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoJGRvY3VtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5pb24tYXV0b2NvbXBsZXRlLWNvbnRhaW5lci4nICsgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5yYW5kb21Dc3NDbGFzcyArICcgaW5wdXQnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvY3VzIG9uIHRoZSBzZWFyY2ggaW5wdXQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWFyY2hJbnB1dEVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaElucHV0RWxlbWVudFswXS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hJbnB1dEVsZW1lbnRbMF0uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yY2UgdGhlIGNvbGxlY3Rpb24gcmVwZWF0IHRvIHJlZHJhdyBpdHNlbGYgYXMgdGhlcmUgd2VyZSBpc3N1ZXMgd2hlbiB0aGUgZmlyc3QgaXRlbXMgd2VyZSBhZGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgJGlvbmljU2Nyb2xsRGVsZWdhdGUucmVzaXplKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaENvbnRhaW5lckRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5oaWRlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGRvY3VtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5pb24tYXV0b2NvbXBsZXRlLWNvbnRhaW5lci4nICsgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5yYW5kb21Dc3NDbGFzcykpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlYXJjaFF1ZXJ5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGlvbmljQmFja2Ryb3AucmVsZWFzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGRlcmVnaXN0ZXJCYWNrQnV0dG9uICYmIHNjb3BlLiRkZXJlZ2lzdGVyQmFja0J1dHRvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQ29udGFpbmVyRGlzcGxheWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqZWN0IHRvIHN0b3JlIGlmIHRoZSB1c2VyIG1vdmVkIHRoZSBmaW5nZXIgdG8gcHJldmVudCBvcGVuaW5nIHRoZSBtb2RhbFxuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsaW5nID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRYOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRZOiAwXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHN0YXJ0IGNvb3JkaW5hdGVzIG9mIHRoZSB0b3VjaCBzdGFydCBldmVudFxuICAgICAgICAgICAgICAgICAgICB2YXIgb25Ub3VjaFN0YXJ0ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlIG9yaWdpbmFsRXZlbnQgd2hlbiBhdmFpbGFibGUsIGZpeCBjb21wYXRpYmlsaXR5IHdpdGggalF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mKGUub3JpZ2luYWxFdmVudCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZy5zdGFydFggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZy5zdGFydFkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgZmluZ2VyIG1vdmVzIG1vcmUgdGhhbiAxMHB4IGFuZCBzZXQgdGhlIG1vdmVkIGZsYWcgdG8gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB2YXIgb25Ub3VjaE1vdmUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlIG9yaWdpbmFsRXZlbnQgd2hlbiBhdmFpbGFibGUsIGZpeCBjb21wYXRpYmlsaXR5IHdpdGggalF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mKGUub3JpZ2luYWxFdmVudCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhlLnRvdWNoZXNbMF0uY2xpZW50WCAtIHNjcm9sbGluZy5zdGFydFgpID4gMTAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmFicyhlLnRvdWNoZXNbMF0uY2xpZW50WSAtIHNjcm9sbGluZy5zdGFydFkpID4gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxpbmcubW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNsaWNrIGhhbmRsZXIgb24gdGhlIGlucHV0IGZpZWxkIHRvIHNob3cgdGhlIHNlYXJjaCBjb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9uQ2xpY2sgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgb3BlbiB0aGUgZGlhbG9nIGlmIHdhcyBub3QgdG91Y2hlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbGVnaXRpbWF0ZSBzY3JvbGwgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGxpbmcubW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXZlbnQgdGhlIGRlZmF1bHQgZXZlbnQgYW5kIHRoZSBwcm9wYWdhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIHRoZSBmZXRjaCBzZWFyY2ggcXVlcnkgbWV0aG9kIG9uY2UgdG8gYmUgYWJsZSB0byBpbml0aWFsaXplIGl0IHdoZW4gdGhlIG1vZGFsIGlzIHNob3duXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2UgYW4gZW1wdHkgc3RyaW5nIHRvIHNpZ25hbCB0aGF0IHRoZXJlIGlzIG5vIGNoYW5nZSBpbiB0aGUgc2VhcmNoIHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmZldGNoU2VhcmNoUXVlcnkoXCJcIiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNob3cgdGhlIGlvbmljIGJhY2tkcm9wIGFuZCB0aGUgc2VhcmNoIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5zaG93TW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaXNLZXlWYWx1ZUluT2JqZWN0QXJyYXkgPSBmdW5jdGlvbiAob2JqZWN0QXJyYXksIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0QXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5nZXRJdGVtVmFsdWUob2JqZWN0QXJyYXlbaV0sIGtleSkgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiB0byBjYWxsIHRoZSBtb2RlbCB0byBpdGVtIG1ldGhvZCBhbmQgc2VsZWN0IHRoZSBpdGVtXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXNvbHZlQW5kU2VsZWN0TW9kZWxJdGVtID0gZnVuY3Rpb24gKG1vZGVsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGdpdmVuIGZ1bmN0aW9uIHRvIGEgJHEgcHJvbWlzZSB0byBzdXBwb3J0IHByb21pc2VzIHRvb1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSAkcS53aGVuKGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIubW9kZWxUb0l0ZW1NZXRob2Qoe21vZGVsVmFsdWU6IG1vZGVsVmFsdWV9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocHJvbWlzZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWxlY3QgdGhlIGl0ZW0gd2hpY2ggYXJlIHJldHVybmVkIGJ5IHRoZSBtb2RlbCB0byBpdGVtIG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0SXRlbShwcm9taXNlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWplY3QgdGhlIGVycm9yIGJlY2F1c2Ugd2UgZG8gbm90IGhhbmRsZSB0aGUgZXJyb3IgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGNsaWNrIGlzIG5vdCBoYW5kbGVkIGV4dGVybmFsbHksIGJpbmQgdGhlIGhhbmRsZXJzIHRvIHRoZSBjbGljayBhbmQgdG91Y2ggZXZlbnRzIG9mIHRoZSBpbnB1dCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBpZiAoaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5tYW5hZ2VFeHRlcm5hbGx5ID09IFwiZmFsc2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZCgndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCd0b3VjaGVuZCBjbGljayBmb2N1cycsIG9uQ2xpY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FuY2VsIGhhbmRsZXIgZm9yIHRoZSBjYW5jZWwgYnV0dG9uIHdoaWNoIGNsZWFycyB0aGUgc2VhcmNoIGlucHV0IGZpZWxkIG1vZGVsIGFuZCBoaWRlcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VhcmNoIGNvbnRhaW5lciBhbmQgdGhlIGlvbmljIGJhY2tkcm9wIGFuZCBjYWxscyB0aGUgY2FuY2VsIGJ1dHRvbiBjbGlja2VkIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuY2FuY2VsQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmhpZGVNb2RhbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIGNhbmNlbCBidXR0b24gY2xpY2tlZCBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmNhbmNlbEJ1dHRvbkNsaWNrZWRNZXRob2QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW9uQXV0b2NvbXBsZXRlQ29udHJvbGxlci5jYW5jZWxCdXR0b25DbGlja2VkTWV0aG9kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM6IGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtcy5zbGljZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQ6IGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuY29tcG9uZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhdGNoIHRoZSBleHRlcm5hbCBtb2RlbCBmb3IgY2hhbmdlcyBhbmQgc2VsZWN0IHRoZSBpdGVtcyBpbnNpZGUgdGhlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChcInZpZXdNb2RlbC5leHRlcm5hbE1vZGVsXCIsIGZ1bmN0aW9uIChuZXdNb2RlbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KG5ld01vZGVsKSAmJiBuZXdNb2RlbC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBzZWxlY3RlZCBpdGVtcyBhbmQgc2V0IHRoZSB2aWV3IHZhbHVlIGFuZCByZW5kZXIgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZ01vZGVsQ29udHJvbGxlci4kc2V0Vmlld1ZhbHVlKGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbENvbnRyb2xsZXIuJHJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcG9wdWxhdGUgdmlldyBhbmQgc2VsZWN0ZWQgaXRlbXMgaWYgZXh0ZXJuYWwgbW9kZWwgaXMgYWxyZWFkeSBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdNb2RlbCAmJiBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5tb2RlbFRvSXRlbU1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KG5ld01vZGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG5ld01vZGVsLCBmdW5jdGlvbiAobW9kZWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZUFuZFNlbGVjdE1vZGVsSXRlbShtb2RlbFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlQW5kU2VsZWN0TW9kZWxJdGVtKG5ld01vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgY29tcG9uZW50IGZyb20gdGhlIGRvbSB3aGVuIHNjb3BlIGlzIGdldHRpbmcgZGVzdHJveWVkXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZ3VsYXIgdGFrZXMgY2FyZSBvZiBjbGVhbmluZyBhbGwgJHdhdGNoJ3MgYW5kIGxpc3RlbmVycywgYnV0IHdlIHN0aWxsIG5lZWQgdG8gcmVtb3ZlIHRoZSBtb2RhbFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoSW5wdXRFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZW5kZXIgdGhlIHZpZXcgdmFsdWUgb2YgdGhlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgIG5nTW9kZWxDb250cm9sbGVyLiRyZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbChpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmdldEl0ZW1WYWx1ZShuZ01vZGVsQ29udHJvbGxlci4kdmlld1ZhbHVlLCBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLml0ZW1WaWV3VmFsdWVLZXkpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHZpZXcgdmFsdWUgb2YgdGhlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgIG5nTW9kZWxDb250cm9sbGVyLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24gKG1vZGVsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2aWV3VmFsdWUgPSBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmdldEl0ZW1WYWx1ZShtb2RlbFZhbHVlLCBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLml0ZW1WaWV3VmFsdWVLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZSA9PSB1bmRlZmluZWQgPyBcIlwiIDogdmlld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG1vZGVsIHZhbHVlIG9mIHRoZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICBuZ01vZGVsQ29udHJvbGxlci4kcGFyc2Vycy5wdXNoKGZ1bmN0aW9uICh2aWV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpb25BdXRvY29tcGxldGVDb250cm9sbGVyLmdldEl0ZW1WYWx1ZSh2aWV3VmFsdWUsIGlvbkF1dG9jb21wbGV0ZUNvbnRyb2xsZXIuaXRlbVZhbHVlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbl0pO1xuXG59KSgpO1xuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgaW9uQXV0b2NvbXBsZXRlICE9IFwidW5kZWZpbmVkXCIgPyBpb25BdXRvY29tcGxldGUgOiB3aW5kb3cuaW9uQXV0b2NvbXBsZXRlKTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuIiwiOyB2YXIgX19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuYW5ndWxhci5tb2R1bGUoJ2lvbmljLndpemFyZCcsIFtdKVxuICAgIC5kaXJlY3RpdmUoJ2lvbldpemFyZENvbnRlbnQnLCBbJ2lvbkNvbnRlbnREaXJlY3RpdmUnLCBmdW5jdGlvbihpb25Db250ZW50RGlyZWN0aXZlKSB7XG4gICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe30sIGlvbkNvbnRlbnREaXJlY3RpdmVbMF0sIHsgc2NvcGU6IGZhbHNlIH0pO1xuICAgIH1dKVxuICAgIC5kaXJlY3RpdmUoJ2lvbldpemFyZCcsIFsnJHJvb3RTY29wZScsICckaW9uaWNTbGlkZUJveERlbGVnYXRlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZSkge1xuICAgICAgICByZXR1cm57XG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZGl0aW9ucyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDb25kaXRpb24gPSBmdW5jdGlvbihjb25kaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZGl0aW9ucy5wdXNoKGNvbmRpdGlvbik7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q29uZGl0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmRpdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrTmV4dENvbmRpdGlvbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCA+IChjb25kaXRpb25zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGNvbmRpdGlvbnNbaW5kZXhdLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1ByZXZpb3VzQ29uZGl0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ID4gKGNvbmRpdGlvbnMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIDogY29uZGl0aW9uc1tpbmRleF0ucHJldigpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29udHJvbGxlcikge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgICAgICAgICAgICAgJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZS5lbmFibGVTbGlkZShmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgJzEwMCUnKTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbihcIndpemFyZDpQcmV2aW91c1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZS5wcmV2aW91cygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRvbihcIndpemFyZDpOZXh0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkaW9uaWNTbGlkZUJveERlbGVnYXRlLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHdhdGNoIHRoZSBjdXJyZW50IGluZGV4J3MgY29uZGl0aW9uIGZvciBjaGFuZ2VzIGFuZCBicm9hZGNhc3QgdGhlIG5ldyBjb25kaXRpb24gc3RhdGUgb24gY2hhbmdlXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5jaGVja05leHRDb25kaXRpb24oY3VycmVudEluZGV4KSAmJiBjb250cm9sbGVyLmNoZWNrUHJldmlvdXNDb25kaXRpb24oY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFwid2l6YXJkOk5leHRDb25kaXRpb25cIiwgY29udHJvbGxlci5jaGVja05leHRDb25kaXRpb24oY3VycmVudEluZGV4KSk7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChcIndpemFyZDpQcmV2aW91c0NvbmRpdGlvblwiLCBjb250cm9sbGVyLmNoZWNrUHJldmlvdXNDb25kaXRpb24oY3VycmVudEluZGV4KSk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbihcInNsaWRlQm94LnNsaWRlQ2hhbmdlZFwiLCBmdW5jdGlvbihlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfV0pXG4gICAgLmRpcmVjdGl2ZSgnaW9uV2l6YXJkU3RlcCcsIFsnJHEnLCBmdW5jdGlvbigkcSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIG5leHRDb25kaXRpb25GbjogJyZuZXh0Q29uZGl0aW9uJyxcbiAgICAgICAgICAgICAgICBwcmV2Q29uZGl0aW9uRm46IFwiJnByZXZDb25kaXRpb25cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcXVpcmU6ICdeXmlvbldpemFyZCcsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gY29uZGl0aW9uLCBqdXN0IHNldCB0aGUgY29uZGl0aW9uIHRvIHRydWUsIG90aGVyd2lzZSBldmFsdWF0ZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5uZXh0Q29uZGl0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHNjb3BlLm5leHRDb25kaXRpb25GbigpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJldkZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLnByZXZDb25kaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc2NvcGUucHJldkNvbmRpdGlvbkZuKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBjb25kaXRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICBuZXh0OiBuZXh0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHByZXY6IHByZXZGblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFkZENvbmRpdGlvbihjb25kaXRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKVxuICAgIC5kaXJlY3RpdmUoJ2lvbldpemFyZFByZXZpb3VzJywgWyckcm9vdFNjb3BlJywgJyRpb25pY1NsaWRlQm94RGVsZWdhdGUnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkaW9uaWNTbGlkZUJveERlbGVnYXRlKSB7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb250cm9sbGVyKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZS5jdXJyZW50SW5kZXgoKSA9PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbmctaGlkZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChcIndpemFyZDpQcmV2aW91c1wiKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbihcInNsaWRlQm94LnNsaWRlQ2hhbmdlZFwiLCBmdW5jdGlvbihlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCduZy1oaWRlJywgaW5kZXggPT0gMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKFwid2l6YXJkOlByZXZpb3VzQ29uZGl0aW9uXCIsIGZ1bmN0aW9uKGUsIGNvbmRpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmF0dHIoXCJkaXNhYmxlZFwiLCAhY29uZGl0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKVxuICAgIC5kaXJlY3RpdmUoJ2lvbldpemFyZE5leHQnLCBbJyRyb290U2NvcGUnLCAnJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZScsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRpb25pY1NsaWRlQm94RGVsZWdhdGUpIHtcbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICBzY29wZToge30sXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZS5jdXJyZW50SW5kZXgoKSA9PSAkaW9uaWNTbGlkZUJveERlbGVnYXRlLnNsaWRlc0NvdW50KCkgLSAxKXtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbmctaGlkZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoXCJ3aXphcmQ6TmV4dFwiKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbihcInNsaWRlQm94LnNsaWRlQ2hhbmdlZFwiLCBmdW5jdGlvbihlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCduZy1oaWRlJywgaW5kZXggPT0gJGlvbmljU2xpZGVCb3hEZWxlZ2F0ZS5zbGlkZXNDb3VudCgpIC0gMSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oXCJ3aXphcmQ6TmV4dENvbmRpdGlvblwiLCBmdW5jdGlvbihlLCBjb25kaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyKFwiZGlzYWJsZWRcIiwgIWNvbmRpdGlvbik7IFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pXG4gICAgLmRpcmVjdGl2ZSgnaW9uV2l6YXJkU3RhcnQnLCBbJyRpb25pY1NsaWRlQm94RGVsZWdhdGUnLCBmdW5jdGlvbigkaW9uaWNTbGlkZUJveERlbGVnYXRlKSB7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzdGFydEZuOiAnJmlvbldpemFyZFN0YXJ0JyxcbiAgICAgICAgICAgICAgICBzdGFydENvbmRpdGlvbjogJyZjb25kaXRpb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbmctaGlkZScpO1xuICAgICAgICAgICAgICAgIGlmICgkaW9uaWNTbGlkZUJveERlbGVnYXRlLmN1cnJlbnRJbmRleCgpID09ICRpb25pY1NsaWRlQm94RGVsZWdhdGUuc2xpZGVzQ291bnQoKSAtIDEpe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCduZy1oaWRlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tDb25kaXRpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5jb25kaXRpb24pKSA/IHRydWUgOiBzY29wZS5zdGFydENvbmRpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnN0YXJ0Rm4oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrQ29uZGl0aW9uKClcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyKCdkaXNhYmxlZCcsICFyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKFwic2xpZGVCb3guc2xpZGVDaGFuZ2VkXCIsIGZ1bmN0aW9uKGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ25nLWhpZGUnLCBpbmRleCA8ICRpb25pY1NsaWRlQm94RGVsZWdhdGUuc2xpZGVzQ291bnQoKSAtIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG47IGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKHR5cGVvZiBpb25pY1dpemFyZCAhPSBcInVuZGVmaW5lZFwiID8gaW9uaWNXaXphcmQgOiB3aW5kb3cuaW9uaWNXaXphcmQpO1xuXG59KS5jYWxsKGdsb2JhbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiBkZWZpbmVFeHBvcnQoZXgpIHsgbW9kdWxlLmV4cG9ydHMgPSBleDsgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcE1haW4oJGlvbmljUGxhdGZvcm0sICRyb290U2NvcGUsICRzdGF0ZSwgTG9jYWxTdG9yYWdlU2VydmljZSwgSGVscGVyU2VydmljZSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgIGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xuXG4gICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlKSB7XG4gICAgdmFyIGxlYWRJbmZvID0gTG9jYWxTdG9yYWdlU2VydmljZS5nZXRPYmplY3QoJ2xlYWRJbmZvJyk7XG4gICAgaWYgKHRvU3RhdGUubmFtZSA9PT0gJ3N0ZXAyJyAmJiBsZWFkSW5mbykge1xuICAgICAgdmFyIHRlbXBsYXRlID0gSGVscGVyU2VydmljZS5nZXRTdGVwMlRlbXBsYXRlKCk7XG4gICAgICB0b1N0YXRlLnRlbXBsYXRlVXJsID0gJ2pzL21vZHVsZXMvc3RlcDIvJyArIHRlbXBsYXRlO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gW1xuICAnJGlvbmljUGxhdGZvcm0nLFxuICAnJHJvb3RTY29wZScsXG4gICckc3RhdGUnLFxuICAnTG9jYWxTdG9yYWdlU2VydmljZScsXG4gICdIZWxwZXJTZXJ2aWNlJyxcbiAgQXBwTWFpblxuXTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnYW5ndWxhci1tZXNzYWdlcycpO1xucmVxdWlyZSgnaW9uQXV0b2NvbXBsZXRlJyk7XG5yZXF1aXJlKCdpb25pY1dpemFyZCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3V0aWxzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvbWV0YWRhdGEnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9zdGVwMScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3N0ZXAyJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvc3RlcDMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9sb2dpbicpO1xuXG5hbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgcmVxdWlyZXM9IFtcbiAgICAnaW9uaWMnLFxuICAgICdpb24tYXV0b2NvbXBsZXRlJyxcbiAgICAnaW9uaWMud2l6YXJkJyxcbiAgICAnbmdNZXNzYWdlcycsXG4gICAgJ2FwcC51dGlscycsXG4gICAgJ2FwcC5tZXRhZGF0YScsXG4gICAgJ2FwcC5zdGVwMScsXG4gICAgJ2FwcC5zdGVwMicsXG4gICAgJ2FwcC5zdGVwMycsXG4gICAgJ2FwcC5sb2dpbidcbiAgXTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCByZXF1aXJlcylcbiAgICAuY29uc3RhbnQoJ0FwcFNldHRpbmdzJywgcmVxdWlyZSgnLi9jb25zdGFudHMnKSlcbiAgICAuY29uZmlnKHJlcXVpcmUoJy4vcm91dGVyJykpXG4gICAgLnJ1bihyZXF1aXJlKCcuL2FwcC1tYWluJykpO1xuXG4gIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ2FwcCddKTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBFeHBvcnRzXG4vLyAtLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXBpVXJsOiAnaHR0cDovLzU0LjE3OS4xNjQuMTE3J1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gRXhwb3J0c1xuLy8gLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYXBwLmxvZ2luJywgW10pXG4gIC5jb250cm9sbGVyKCdMb2dpbkNvbnRyb2xsZXInLCByZXF1aXJlKCcuL2xvZ2luLWNvbnRyb2xsZXInKSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTG9naW5Db250cm9sbGVyKCkge1xuICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7fSk7XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gW1xuICBMb2dpbkNvbnRyb2xsZXJcbl07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2FwcC5tZXRhZGF0YScsIFtdKVxuICAuZmFjdG9yeSgnTWV0YWRhdGFTZXJ2aWNlJywgcmVxdWlyZSgnLi9tZXRhZGF0YS1zZXJ2aWNlJykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBNZXRhZGF0YVNlcnZpY2UoJGh0dHAsICRxLCBBcHBTZXR0aW5ncykge1xuICByZXR1cm4ge1xuICAgIGdldEFsbDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgJGh0dHAuZ2V0KCdqcy9tb2R1bGVzL21ldGFkYXRhL21ldGFkYXRhLmpzb24nKVxuICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9KVxuICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyLCBzdGF0dXMpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyLCBzdGF0dXMpO1xuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIGdldE1ldGFkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBtZXRhID0gYXJndW1lbnRzWzBdIHx8ICdsb2NhdGlvbnMnO1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHZhciByZXEgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogQXBwU2V0dGluZ3MuYXBpVXJsICsgJy8nICsgbWV0YVxuICAgICAgfTtcbiAgICAgICRodHRwKHJlcSlcbiAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycm9yLCBzdGF0dXMpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IsIHN0YXR1cyk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gWyckaHR0cCcsICckcScsICdBcHBTZXR0aW5ncycsIE1ldGFkYXRhU2VydmljZV07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGVwMScsIFtdKVxuICAuZmFjdG9yeSgnU3RlcDFTZXJ2aWNlJywgcmVxdWlyZSgnLi9zdGVwMS1zZXJ2aWNlJykpXG4gIC5jb250cm9sbGVyKCdTdGVwMUNvbnRyb2xsZXInLCByZXF1aXJlKCcuL3N0ZXAxLWNvbnRyb2xsZXInKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFN0ZXAxQ29udHJvbGxlcihtZXRhZGF0YSwgbG9jYXRpb25zLCBTdGVwMVNlcnZpY2UsIExvY2FsU3RvcmFnZVNlcnZpY2UsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwLCAkc3RhdGUsICRmaWx0ZXIpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdmFsaWRMb2FuVHlwZXMgPSBtZXRhZGF0YS5sb2FuLnR5cGVzO1xuICB2YXIgdHlwZSA9ICRzdGF0ZS5wYXJhbXMudHlwZTtcbiAgdmFyIGxvYW5UeXBlID0gdHlwZSAmJiB2YWxpZExvYW5UeXBlcy5pbmRleE9mKHR5cGUudG9Mb3dlckNhc2UoKSkgIT09IC0xID8gdHlwZSA6ICdwZXJzb25hbCc7XG5cbiAgdmFyIG1vZGVsID0ge1xuICAgIGFwcGxpY2F0aW9uczogW1xuICAgICAgeyB0eXBlOiBsb2FuVHlwZSB9XG4gICAgXVxuICB9O1xuXG4gIGZ1bmN0aW9uIGFwcGx5KCkge1xuICAgICRpb25pY0xvYWRpbmcuc2hvdyh7XG4gICAgICB0ZW1wbGF0ZTogJ1Byb2Nlc3NpbmcuLi4nXG4gICAgfSk7XG5cbiAgICBTdGVwMVNlcnZpY2UuY3JlYXRlKHNlbGYubW9kZWwpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0T2JqZWN0KCdsZWFkSW5mbycsIHJlc3BvbnNlKTtcbiAgICAgICRzdGF0ZS5nbygnc3RlcDInKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgIHZhciBsZWFkSW5mbyA9IGVyci5sZWFkSW5mbztcbiAgICAgIGlmIChlcnIuc3RhdHVzQ29kZSA9PT0gNDA5KSB7XG4gICAgICAgIHZhciBjb25maXJtUG9wdXAgPSAkaW9uaWNQb3B1cC5jb25maXJtKHtcbiAgICAgICAgICB0aXRsZTogJ0hpICcgKyBsZWFkSW5mby5wcm9maWxlLmZpcnN0bmFtZSArICchJyxcbiAgICAgICAgICB0ZW1wbGF0ZTogW1xuICAgICAgICAgICAgJ1dlIGZvdW5kIG91dCB0aGF0IHlvdSBoYXZlIGFuIGV4aXN0aW5nICcsXG4gICAgICAgICAgICAnPHN0cm9uZz4nICsgbGVhZEluZm8uYXBwbGljYXRpb24udHlwZSArICcgbG9hbjwvc3Ryb25nPiBhcHBsaWNhdGlvbiAnLFxuICAgICAgICAgICAgJ3VzaW5nIHRoZSBzYW1lIGVtYWlsIGFkZHJlc3Mgb3IgbW9iaWxlIG51bWJlciB0aGF0IHlvdSBwcm92aWRlZC4gJyxcbiAgICAgICAgICAgICdEbyB5b3Ugd2FudCB0byBwcm9jZWVkIHRvIHRoZSBuZXh0IHN0ZXA/J1xuICAgICAgICAgIF0uam9pbignJyksXG4gICAgICAgICAgY2FuY2VsVGV4dDogJ05vJyxcbiAgICAgICAgICBva1RleHQ6ICdZZXMnXG4gICAgICAgIH0pO1xuICAgICAgICBjb25maXJtUG9wdXAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlYWRJbmZvLnN0YXR1cykge1xuICAgICAgICAgICAgICBjYXNlICcxJzpcbiAgICAgICAgICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldE9iamVjdCgnbGVhZEluZm8nLCBsZWFkSW5mbyk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdzdGVwMicpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICcyJzpcbiAgICAgICAgICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldE9iamVjdCgnbGVhZEluZm8nLCBsZWFkSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8kc3RhdGUuZ28oJ3N0ZXAzJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8kc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgIHRpdGxlOiAnT29wcy4uLicsXG4gICAgICAgICB0ZW1wbGF0ZTogJ1RoZXJlIHdhcyBhbiBlcnJvciBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdC4nXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmZpbmFsbHkoZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLmhpZGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExvY2F0aW9ucyhzZWFyY2hUZXh0KSB7XG4gICAgdmFyIGZpbHRlcmVkID0gW107XG4gICAgaWYgKHNlYXJjaFRleHQpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChsb2NhdGlvbnMsIGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgIGlmIChsb2NhdGlvbi5jaXR5TmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCkge1xuICAgICAgICAgIGZpbHRlcmVkLnB1c2gobG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsdGVyZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBpdGVtc0NsaWNrZWQoY2FsbGJhY2spIHtcbiAgICBzZWxmLm1vZGVsLnByb2ZpbGUuYWRkcmVzcyA9IGNhbGxiYWNrLml0ZW0uY2l0eU5hbWU7XG4gIH1cblxuICBmdW5jdGlvbiBpdGVtc1JlbW92ZWQoY2FsbGJhY2spIHtcbiAgICBzZWxmLm1vZGVsLnByb2ZpbGUuYWRkcmVzcyA9ICcnO1xuICB9XG5cbiAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgIGFwcGx5OiBhcHBseSxcbiAgICBtb2RlbDogbW9kZWwsXG4gICAgZXJyb3JNZXNzYWdlczogbWV0YWRhdGEuZXJyb3JNZXNzYWdlcyxcbiAgICBnZXRMb2NhdGlvbnM6IGdldExvY2F0aW9ucyxcbiAgICBpbmNvbWVTb3VyY2VzOiBtZXRhZGF0YS5pbmNvbWVTb3VyY2VzLFxuICAgIGl0ZW1zQ2xpY2tlZDogaXRlbXNDbGlja2VkLFxuICAgIGl0ZW1zUmVtb3ZlZDogaXRlbXNSZW1vdmVkXG4gIH0pO1xufVxuXG4vLyBFeHBvcnRzXG4vLyAtLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ21ldGFkYXRhJyxcbiAgJ2xvY2F0aW9ucycsXG4gICdTdGVwMVNlcnZpY2UnLFxuICAnTG9jYWxTdG9yYWdlU2VydmljZScsXG4gICckaW9uaWNMb2FkaW5nJyxcbiAgJyRpb25pY1BvcHVwJyxcbiAgJyRzdGF0ZScsXG4gICckZmlsdGVyJyxcbiAgU3RlcDFDb250cm9sbGVyXG5dO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTdGVwMVNlcnZpY2UoJGh0dHAsICRxLCBBcHBTZXR0aW5ncykge1xuICByZXR1cm4ge1xuICAgIGNyZWF0ZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHZhciByZXEgPSB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6IEFwcFNldHRpbmdzLmFwaVVybCArICcvbGVhZHMnLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9O1xuICAgICAgJGh0dHAocmVxKVxuICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9KVxuICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3IsIHN0YXR1cykge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvciwgc3RhdHVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gRXhwb3J0c1xuLy8gLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMgPSBbJyRodHRwJywgJyRxJywgJ0FwcFNldHRpbmdzJywgU3RlcDFTZXJ2aWNlXTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gRXhwb3J0c1xuLy8gLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0ZXAyJywgW10pXG4gIC5mYWN0b3J5KCdTdGVwMlNlcnZpY2UnLCByZXF1aXJlKCcuL3N0ZXAyLXNlcnZpY2UnKSlcbiAgLmNvbnRyb2xsZXIoJ1N0ZXAyQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vc3RlcDItY29udHJvbGxlcicpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU3RlcDJDb250cm9sbGVyKG1ldGFkYXRhKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIG1vZGVsID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0SW5kdXN0cmllcyhzZWFyY2hUZXh0KSB7XG4gICAgdmFyIGZpbHRlcmVkID0gW107XG4gICAgaWYgKHNlYXJjaFRleHQpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChtZXRhZGF0YS5jb21wYW55LmluZHVzdHJpZXMsIGZ1bmN0aW9uKGluZHVzdHJ5KSB7XG4gICAgICAgIGlmIChpbmR1c3RyeS50ZXh0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKSB7XG4gICAgICAgICAgZmlsdGVyZWQucHVzaChpbmR1c3RyeSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluZHVzdHJ5Q2xpY2tlZChjYWxsYmFjaykge1xuICAgIHNlbGYubW9kZWwuY29tcGFueS5pbmR1c3RyeSA9IGNhbGxiYWNrLml0ZW0udGV4dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluZHVzdHJ5UmVtb3ZlZChjYWxsYmFjaykge1xuICAgIHNlbGYubW9kZWwuY29tcGFueS5pbmR1c3RyeSA9ICcnO1xuICB9XG5cbiAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgIG1vZGVsOiBtb2RlbCxcbiAgICBtYXhNb250aDogbmV3IERhdGUoKSxcbiAgICBlcnJvck1lc3NhZ2VzOiBtZXRhZGF0YS5lcnJvck1lc3NhZ2VzLFxuICAgIHJlZ2lzdHJhcnM6IG1ldGFkYXRhLmNvbXBhbnkucmVnaXN0cmFycyxcbiAgICBnZXRJbmR1c3RyaWVzOiBnZXRJbmR1c3RyaWVzLFxuICAgIGluZHVzdHJ5Q2xpY2tlZDogaW5kdXN0cnlDbGlja2VkLFxuICAgIGluZHVzdHJ5UmVtb3ZlZDogaW5kdXN0cnlSZW1vdmVkXG4gIH0pO1xufVxuXG4vLyBFeHBvcnRzXG4vLyAtLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ21ldGFkYXRhJyxcbiAgU3RlcDJDb250cm9sbGVyXG5dO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTdGVwMlNlcnZpY2UoJGh0dHAsICRxLCBBcHBTZXR0aW5ncykge1xuICByZXR1cm4ge307XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gWyckaHR0cCcsICckcScsICdBcHBTZXR0aW5ncycsIFN0ZXAyU2VydmljZV07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGVwMycsIFtdKVxuICAuY29udHJvbGxlcignU3RlcDNDb250cm9sbGVyJywgcmVxdWlyZSgnLi9zdGVwMy1jb250cm9sbGVyJykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTdGVwM0NvbnRyb2xsZXIoKSB7XG4gIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHt9KTtcbn1cblxuLy8gRXhwb3J0c1xuLy8gLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMgPSBbXG4gIFN0ZXAzQ29udHJvbGxlclxuXTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSGVscGVyU2VydmljZSgpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTdGVwMlRlbXBsYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAnc3RlcDItZW1wbG95bWVudC5odG1sJztcbiAgICB9XG4gIH07XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gW0hlbHBlclNlcnZpY2VdO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBFeHBvcnRzXG4vLyAtLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdhcHAudXRpbHMnLCBbXSlcbiAgLmZhY3RvcnkoJ0xvY2FsU3RvcmFnZVNlcnZpY2UnLCByZXF1aXJlKCcuL2xvY2Fsc3RvcmFnZS1zZXJ2aWNlJykpXG4gIC5mYWN0b3J5KCdIZWxwZXJTZXJ2aWNlJywgcmVxdWlyZSgnLi9oZWxwZXItc2VydmljZScpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTG9jYWxTdG9yYWdlU2VydmljZSgkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVtrZXldID0gdmFsdWU7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2Vba2V5XSB8fCBkZWZhdWx0VmFsdWU7XG4gICAgfSxcbiAgICBzZXRPYmplY3Q6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlW2tleV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfSxcbiAgICBnZXRPYmplY3Q6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Vba2V5XSB8fCAne30nKTtcbiAgICB9XG4gIH07XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gWyckd2luZG93JywgTG9jYWxTdG9yYWdlU2VydmljZV07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJvdXRlcigkc3RhdGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAvLyAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAvLyAgIGVuYWJsZWQ6IHRydWUsXG4gIC8vICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gIC8vIH0pO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgnc3RlcDEnLCB7XG4gICAgdXJsOiAnL2FwcGx5P3R5cGUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbW9kdWxlcy9zdGVwMS9zdGVwMS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3RlcDFDb250cm9sbGVyJyxcbiAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgcmVzb2x2ZToge1xuICAgICAgbWV0YWRhdGE6IFsnTWV0YWRhdGFTZXJ2aWNlJywgZnVuY3Rpb24oTWV0YWRhdGFTZXJ2aWNlKSB7XG4gICAgICAgIHJldHVybiBNZXRhZGF0YVNlcnZpY2UuZ2V0QWxsKCk7XG4gICAgICB9XSxcbiAgICAgIGxvY2F0aW9uczogWydNZXRhZGF0YVNlcnZpY2UnLCBmdW5jdGlvbihNZXRhZGF0YVNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIE1ldGFkYXRhU2VydmljZS5nZXRNZXRhZGF0YSgnbG9jYXRpb25zP2ZpbHRlclthdHRyaWJ1dGVzXVsxXT1jaXR5TmFtZScpO1xuICAgICAgfV1cbiAgICB9XG4gIH0pXG4gIC5zdGF0ZSgnc3RlcDInLCB7XG4gICAgdXJsOiAnL2luZm8nLFxuICAgIGNvbnRyb2xsZXI6ICdTdGVwMkNvbnRyb2xsZXInLFxuICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBtZXRhZGF0YTogWydNZXRhZGF0YVNlcnZpY2UnLCBmdW5jdGlvbihNZXRhZGF0YVNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIE1ldGFkYXRhU2VydmljZS5nZXRBbGwoKTtcbiAgICAgIH1dXG4gICAgfVxuICB9KVxuICAuc3RhdGUoJ3N0ZXAzJywge1xuICAgIHVybDogJy92ZXJpZnknLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbW9kdWxlcy9zdGVwMy9zdGVwMy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3RlcDNDb250cm9sbGVyJyxcbiAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgfSlcbiAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICB1cmw6ICcvbG9naW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbW9kdWxlcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnTG9naW5Db250cm9sbGVyJyxcbiAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgfSk7XG5cbiAgLy8gJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2FwcGx5Jyk7XG59XG5cbi8vIEV4cG9ydHNcbi8vIC0tLS0tLS1cbm1vZHVsZS5leHBvcnRzID0gW1xuICAnJHN0YXRlUHJvdmlkZXInLFxuICAnJGxvY2F0aW9uUHJvdmlkZXInLFxuICAnJHVybFJvdXRlclByb3ZpZGVyJyxcbiAgUm91dGVyXG5dO1xuIl19
