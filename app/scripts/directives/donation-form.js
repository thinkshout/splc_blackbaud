/*'use strict';
angular.module('donationFormDirectives', [])
       .directive('fieldMatches', fieldMatches)
       .directive('creditCardType', creditCardType);

function fieldMatches() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      function validate(value) {
        var isValid = scope.$eval(attrs.fieldsMatch) == value;

        ngModel.$setValidity('field-matches', isValid);

        return isValid ? value : undefined;
      }

      ngModel.$parsers.unshift(validate);

      scope.$watch(attrs.fieldsMatch, function() {
        ngModel.$setViewValue(ngModel.$viewValue);
      });
    }
  }
}

function creditCardType (){
  var directive = {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl){
      ctrl.$parsers.unshift(function(value){
        scope.ccinfo.cardType =
          (/^5[1-5]/.test(value)) ? "mastercard"
            : (/^4/.test(value)) ? "visa"
            : (/^3[47]/.test(value)) ? 'amex'
            : (/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(value)) ? 'discover'
            : undefined;
          ctrl.$setValidity('invalid',!!scope.ccinfo.cardType);
          return value;
      });
    }
  }
  return directive;
}*/
