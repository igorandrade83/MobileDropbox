window.addEventListener('message', function(event) {
    if (event.data == "reload") {
        window.location.reload();
    }
    else if (event.data == "reload(true)") {
        window.location.reload(true);
    }
});

(function($app) {

    var isoDate = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

    /**
     * Fun��o que retorna o formato que ser� utilizado no componente
     * capturando o valor do atributo format do elemento, para mais formatos
     * consulte os formatos permitidos em http://momentjs.com/docs/#/parsing/string-format/
     *
     */
    var patternFormat = function(element) {
        if (element) {
            return $(element).attr('format') || 'DD/MM/YYYY';
        }
        return 'DD/MM/YYYY';
    }

    var parsePermission = function(perm) {



        var result = {
            visible: {
                public: true
            },
            enabled: {
                public: true
            }
        }

        if (perm) {
            var perms = perm.toLowerCase().trim().split(",");
            for (var i=0;i<perms.length;i++) {
                var p = perms[i].trim();
                if (p) {
                    var pair = p.split(":");
                    if (pair.length == 2) {
                        var key = pair[0].trim();
                        var value = pair[1].trim();
                        if (value) {
                            var values = value.split(";");
                            var json = {};
                            for (var j=0;j<values.length;j++) {
                                var v = values[j].trim();
                                if (v) {
                                    json[v] = true;
                                }
                            }
                            result[key] = json;
                        }
                    }
                }
            }
        }
        return result;
    }

    app.directive('asDate', maskDirectiveAsDate)

        .directive('ngDestroy', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs, ctrl) {
                    element.on('$destroy', function() {
                        if (attrs.ngDestroy && attrs.ngDestroy.length > 0)
                            if (attrs.ngDestroy.indexOf('app.') > -1 || attrs.ngDestroy.indexOf('blockly.') > -1)
                                scope.$eval(attrs.ngDestroy);
                            else
                                eval(attrs.ngDestroy);
                    });
                }
            }
        })

        .filter('mask',function($translate) {
            return function(value, maskValue) {
                maskValue = parseMaskType(maskValue, $translate);
                if (!maskValue)
                    return value;

                maskValue = maskValue.replace(';1', '').replace(';0', '').trim();

                if (typeof value == "string" && value.match(isoDate)) {
                    return moment.utc(value).format(maskValue);
                } else if (value instanceof Date) {
                    return moment.utc(value).format(maskValue);
                } else if (typeof value == 'number') {
                    return format(maskValue, value);
                }  else if (value != undefined && value != null && value != "") {
                    var input = $("<input type=\"text\">");
                    input.mask(maskValue);
                    return input.masked(value);
                } else {
                    return value;
                }
            };
        })

        .directive('screenParams', [function() {
            'use strict';
            return {
                link: function(scope, elem, attrs, ctrl) {
                    var screenParams = eval(attrs.screenParams);
                    if (screenParams && screenParams.length) {
                        screenParams.forEach(function(screenParam) {
                            if (scope.params && !scope.params[screenParam.key])
                                scope.params[screenParam.key] = screenParam.value || '';
                        });
                    }
                }
            }
        }])

        .directive('mask', maskDirectiveMask)

        .directive('dynamicImage', function($compile) {
            var template = '';
            return {
                restrict: 'A',
                scope: true,
                require: 'ngModel',
                link: function(scope, element, attr) {
                    var required = (attr.ngRequired && attr.ngRequired == "true"?"required":"");
                    var content = element.html();
                    var templateDyn    =
                        '<div ngf-drop="" ngf-drag-over-class="dragover">\
                           <img style="width: 100%;" ng-if="$ngModel$" data-ng-src="{{$ngModel$.startsWith(\'http\') || ($ngModel$.startsWith(\'/\') && $ngModel$.length < 1000)? $ngModel$ : \'data:image/png;base64,\' + $ngModel$}}">\
                           <div class="btn" ng-if="!$ngModel$" ngf-drop="" ngf-select="" ngf-change="cronapi.internal.setFile(\'$ngModel$\', $file)" ngf-pattern="\'image/*\'" ngf-max-size="$maxFileSize$">\
                             $userHtml$\
                           </div>\
                           <div class="remove-image-button button button-assertive" ng-if="$ngModel$" ng-click="$ngModel$=null">\
                             <span class="icon ion-android-close"></span>\
                           </div>\
                           <div class="button button-positive" ng-if="!$ngModel$" ng-click="cronapi.internal.startCamera(\'$ngModel$\')">\
                             <span class="icon ion-ios-videocam"></span>\
                           </div>\
                         </div>';
                    var maxFileSize = "";
                    if (attr.maxFileSize)
                        maxFileSize = attr.maxFileSize;

                    templateDyn = $(templateDyn
                        .split('$ngModel$').join(attr.ngModel)
                        .split('$required$').join(required)
                        .split('$userHtml$').join(content)
                        .split('$maxFileSize$').join(maxFileSize)
                    );

                    $(element).html(templateDyn);
                    $compile(templateDyn)(element.scope());
                }
            }
        })
        .directive('dynamicFile', function($compile) {
            var template = '';
            return {
                restrict: 'A',
                scope: true,
                require: 'ngModel',
                link: function(scope, element, attr) {
                    var s = scope;
                    var required = (attr.ngRequired && attr.ngRequired == "true"?"required":"");

                    var splitedNgModel = attr.ngModel.split('.');
                    var datasource = splitedNgModel[0];
                    var field = splitedNgModel[splitedNgModel.length-1];
                    var number = Math.floor((Math.random() * 1000) + 20);
                    var content = element.html();

                    var maxFileSize = "";
                    if (attr.maxFileSize)
                        maxFileSize = attr.maxFileSize;

                    var templateDyn    = '\
                                <div ng-show="!$ngModel$" ngf-drop="" ngf-drag-over-class="dragover">\
                                  <div class="btn" ngf-drop="" ngf-select="" ngf-change="cronapi.internal.uploadFile(\'$ngModel$\', $file, \'uploadprogress$number$\')" ngf-max-size="$maxFileSize$">\
                                    $userHtml$\
                                  </div>\
                                  <div class="progress" data-type="bootstrapProgress" id="uploadprogress$number$" style="display:none">\
                                    <div class="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width:0%">\
                                      <span class="sr-only"></span>\
                                    </div>\
                                  </div>\
                                </div> \
                                <div ng-show="$ngModel$" class="upload-image-component-attribute"> \
                                  <div class="button button-assertive" style="float:right;" ng-if="$ngModel$" ng-click="$ngModel$=null"> \
                                    <span class="icon ion-android-close"></span> \
                                  </div> \
                                  <div> \
                                    <div ng-bind-html="cronapi.internal.generatePreviewDescriptionByte($ngModel$)"></div> \
                                    <a href="javascript:void(0)" ng-click="cronapi.internal.downloadFileEntityMobile($datasource$,\'$field$\')">download</a> \
                                  </div> \
                                </div> \
                                ';
                    templateDyn = $(templateDyn
                        .split('$ngModel$').join(attr.ngModel)
                        .split('$datasource$').join(datasource)
                        .split('$field$').join(field)
                        .split('$number$').join(number)
                        .split('$required$').join(required)
                        .split('$userHtml$').join(content)
                        .split('$maxFileSize$').join(maxFileSize)

                    );

                    $(element).html(templateDyn);
                    $compile(templateDyn)(element.scope());
                }
            }
        })
        .directive('pwCheck', [function() {
            'use strict';
            return {
                require: 'ngModel',
                link: function(scope, elem, attrs, ctrl) {
                    var firstPassword = '#' + attrs.pwCheck;
                    elem.add(firstPassword).on('keyup', function() {
                        scope.$apply(function() {
                            var v = elem.val() === $(firstPassword).val();
                            ctrl.$setValidity('pwmatch', v);
                        });
                    });
                }
            }
        }])

        .directive('qr', ['$window', function($window){
            return {
                restrict: 'A',
                require: '^ngModel',
                template: '<canvas ng-hide="image"></canvas><img ng-if="image" ng-src="{{canvasImage}}"/>',
                link: function postlink(scope, element, attrs, ngModel){
                    if (scope.size === undefined  && attrs.size) {
                        scope.text = attrs.size;
                    }
                    var getTypeNumeber = function(){
                        return scope.typeNumber || 0;
                    };
                    var getCorrection = function(){
                        var levels = {
                            'L': 1,
                            'M': 0,
                            'Q': 3,
                            'H': 2
                        };
                        var correctionLevel = scope.correctionLevel || 0;
                        return levels[correctionLevel] || 0;
                    };
                    var getText = function(){
                        return ngModel.$modelValue || "";
                    };
                    var getSize = function(){
                        return scope.size || $(element).outerWidth();
                    };
                    var isNUMBER = function(text){
                        var ALLOWEDCHARS = /^[0-9]*$/;
                        return ALLOWEDCHARS.test(text);
                    };
                    var isALPHA_NUM = function(text){
                        var ALLOWEDCHARS = /^[0-9A-Z $%*+\-./:]*$/;
                        return ALLOWEDCHARS.test(text);
                    };
                    var is8bit = function(text){
                        for (var i = 0; i < text.length; i++) {
                            var code = text.charCodeAt(i);
                            if (code > 255) {
                                return false;
                            }
                        }
                        return true;
                    };
                    var checkInputMode = function(inputMode, text){
                        if (inputMode === 'NUMBER' && !isNUMBER(text)) {
                            throw new Error('The `NUMBER` input mode is invalid for text.');
                        }
                        else if (inputMode === 'ALPHA_NUM' && !isALPHA_NUM(text)) {
                            throw new Error('The `ALPHA_NUM` input mode is invalid for text.');
                        }
                        else if (inputMode === '8bit' && !is8bit(text)) {
                            throw new Error('The `8bit` input mode is invalid for text.');
                        }
                        else if (!is8bit(text)) {
                            throw new Error('Input mode is invalid for text.');
                        }
                        return true;
                    };
                    var getInputMode = function(text){
                        var inputMode = scope.inputMode;
                        inputMode = inputMode || (isNUMBER(text) ? 'NUMBER' : undefined);
                        inputMode = inputMode || (isALPHA_NUM(text) ? 'ALPHA_NUM' : undefined);
                        inputMode = inputMode || (is8bit(text) ? '8bit' : '');
                        return checkInputMode(inputMode, text) ? inputMode : '';
                    };
                    var canvas = element.find('canvas')[0];
                    var canvas2D = !!$window.CanvasRenderingContext2D;
                    scope.TYPE_NUMBER = getTypeNumeber();
                    scope.TEXT = getText();
                    scope.CORRECTION = getCorrection();
                    scope.SIZE = getSize();
                    scope.INPUT_MODE = getInputMode(scope.TEXT);
                    scope.canvasImage = '';
                    var draw = function(context, qr, modules, tile){
                        for (var row = 0; row < modules; row++) {
                            for (var col = 0; col < modules; col++) {
                                var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
                                    h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));
                                context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
                                context.fillRect(Math.round(col * tile), Math.round(row * tile), w, h);
                            }
                        }
                    };
                    var render = function(canvas, value, typeNumber, correction, size, inputMode){
                        var trim = /^\s+|\s+$/g;
                        var text = value.replace(trim, '');
                        var qr = new QRCode(typeNumber, correction, inputMode);
                        qr.addData(text);
                        qr.make();
                        var context = canvas.getContext('2d');
                        var modules = qr.getModuleCount();
                        var tile = size / modules;
                        canvas.width = canvas.height = size;
                        if (canvas2D) {
                            draw(context, qr, modules, tile);
                            scope.canvasImage = canvas.toDataURL() || '';
                        }
                    };

                    scope.$watch(function(){return ngModel.$modelValue}, function(value, old){
                        if (value !== old || value !== scope.TEXT) {
                            scope.text = ngModel.$modelValue;
                            scope.TEXT = getText();
                            scope.INPUT_MODE = getInputMode(scope.TEXT);
                            render(canvas, scope.TEXT, scope.TYPE_NUMBER, scope.CORRECTION, scope.SIZE, scope.INPUT_MODE);
                        }
                    });
                    render(canvas, scope.TEXT, scope.TYPE_NUMBER, scope.CORRECTION, scope.SIZE, scope.INPUT_MODE);
                }};
        }])

        /**
         * Valida��o de campos CPF e CNPJ,
         * para utilizar essa diretiva, adicione o atributo valid com o valor
         * do tipo da valida��o (cpf ou cnpj). Exemplo <input type="text" valid="cpf">
         */
        .directive('valid', function() {
            return {
                require: '^ngModel',
                restrict: 'A',
                link: function(scope, element, attrs, ngModel) {
                    var validator = {
                        'cpf': CPF,
                        'cnpj': CNPJ
                    };

                    ngModel.$validators[attrs.valid] = function(modelValue, viewValue) {
                        var value = modelValue || viewValue;
                        var fieldValid = validator[attrs.valid].isValid(value);
                        if (!fieldValid) {
                            element.scope().$applyAsync(function(){ element[0].setCustomValidity(element[0].dataset['errorMessage']); }) ;
                        } else {
                            element[0].setCustomValidity("");
                        }
                        return (fieldValid || !value);
                    };
                }
            }
        })

        .directive('cronappSecurity', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var roles = [];
                    var user = JSON.parse(localStorage.getItem('_u'))
                    if (user && user.roles) {
                        roles = user.roles.toLowerCase().split(",");
                    }

                    var perms = parsePermission(attrs.cronappSecurity);
                    var show = false;
                    var enabled = false;
                    for (var i=0;i<roles.length;i++) {
                        var role = roles[i].trim();
                        if (role) {
                            if (perms.visible[role]) {
                                show = true;
                            }
                            if (perms.enabled[role]) {
                                enabled = true;
                            }
                        }
                    }

                    if (!show) {
                        $(element).hide();
                    }

                    if (!enabled) {
                        $(element).find('*').addBack().attr('disabled', true);
                    }
                }
            }
        })

        .directive('cronappStars', [function() {
            'use strict';
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elem, attrs, ngModelCtrl) {

                    var $elem = $(elem);
                    var $star = $('<i style="font-size: 200%" class="component-holder ion ion-android-star-outline" style="" xattr-size="" data-component="crn-icon"></i>' );

                    $elem.html("");
                    var stars = [];

                    for (var i=1;i<=5;i++) {
                        var clonned = $star.clone();
                        $elem.append(clonned);

                        clonned.attr("idx", i);
                        clonned.click(function() {
                            scope.$apply(function() {
                                ngModelCtrl.$viewValue = parseInt($(this).attr("idx")); //set new view value
                                ngModelCtrl.$commitViewValue();

                            }.bind(this));
                        });

                        stars.push(clonned);
                    }

                    function changeStars(value) {
                        for (var i=1;i<=5;i++) {
                            stars[i-1].removeClass('ion-android-star-outline');
                            stars[i-1].removeClass('ion-android-star');
                            if (i <= value) {
                                stars[i-1].addClass('ion-android-star');
                            } else {
                                stars[i-1].addClass('ion-android-star-outline');
                            }
                        }

                        return value;
                    }

                    ngModelCtrl.$parsers.push(changeStars);
                    ngModelCtrl.$formatters.push(changeStars);

                }
            }
        }])

        .directive('cronappFilter', function($compile) {
            var setFilterInButton = function($element, bindedFilter, operator) {
                var fieldset = $element.closest('fieldset');
                if (!fieldset)
                    return;
                var button = fieldset.find('button[cronapp-filter]');
                if (!button)
                    return;

                var filters = button.data('filters');
                if (!filters)
                    filters = [];

                var index = -1;
                var ngModel = $element.attr('ng-model');
                $(filters).each(function(idx) {
                    if (this.ngModel == ngModel)
                        index = idx;
                });

                if (index > -1)
                    filters.splice(index, 1);

                if (bindedFilter.length > 0) {
                    var bindedFilterJson = {
                        "ngModel" : ngModel,
                        "bindedFilter" : bindedFilter
                    };
                    filters.push(bindedFilterJson);
                }
                button.data('filters', filters);
            }

            var makeAutoPostSearch = function($element, bindedFilter, datasource, attrs) {
                var fieldset = $element.closest('fieldset');
                if (fieldset && fieldset.length > 0) {
                    var button = fieldset.find('button[cronapp-filter]');
                    if (button && button.length > 0) {
                        var filters = button.data('filters');
                        if (filters && filters.length > 0) {
                            bindedFilter = '';
                            $(filters).each(function() {
                                bindedFilter += this.bindedFilter+";";
                            });
                        }
                    }
                }
                datasource.search(bindedFilter, (attrs.cronappFilterCaseinsensitive=="true"));
            }

            var inputBehavior = function(scope, element, attrs, ngModelCtrl, $element, typeElement, operator, autopost) {
                var filterTemplate = '';
                var filtersSplited = attrs.cronappFilter.split(';');
                var datasource;
                if (attrs.crnDatasource) {
                    datasource = eval(attrs.crnDatasource);
                } else {
                    var fieldset = $element.closest('fieldset');
                    if (!fieldset)
                        return;
                    var button = fieldset.find('button[cronapp-filter]');
                    if (!button)
                        return;

                    if (!button.attr('crn-datasource')) {
                        return;
                    }

                    datasource = eval(button.attr('crn-datasource'));
                }

                var isOData = datasource.isOData()
                $(filtersSplited).each(function() {
                    if (this.length > 0) {
                        if (filterTemplate != "") {
                            if (isOData) {
                                filterTemplate += " or ";
                            } else {
                                filterTemplate += ";";
                            }
                        }

                        if (isOData) {
                            if (operator == "=" && typeElement == 'text' && filterTemplate == "") {
                                filterTemplate = "substringof({value.lower}, tolower("+this+"))";
                            }
                            else if (operator == "=") {
                                filterTemplate += " substringof({value.lower},tolower("+this+"))";
                            }
                            else if (operator == "!=") {
                                filterTemplate += this + " ne {value}";
                            }
                            else if (operator == ">") {
                                filterTemplate += this + " gt {value}";
                            }
                            else if (operator == ">=") {
                                filterTemplate += this + " ge {value}";
                            }
                            else if (operator == "<") {
                                filterTemplate += this + " lt {value}";
                            }
                            else if (operator == "<=") {
                                filterTemplate += this + " le {value}";
                            }
                        } else {
                            if (typeElement == 'text') {
                                filterTemplate += this + '@' + operator + '%{value}%';
                            } else {
                                filterTemplate += this + operator + '{value}';
                            }
                        }
                    }
                });
                if (filterTemplate.length == 0) {
                    if (isOData) {
                        filterTemplate = "{value}";
                    } else {
                        filterTemplate = '%{value}%';
                    }
                }

                if (ngModelCtrl) {
                    scope.$watch(attrs.ngModel, function(newVal, oldVal) {
                        if (angular.equals(newVal, oldVal)) { return; }
                        var eType = $element.data('type') || $element.attr('type');
                        var value = ngModelCtrl.$modelValue;

                        if (isOData) {

                            if (value instanceof Date) {
                                if (eType == "datetime-local") {
                                    value = "datetimeoffset'" + value.toISOString() + "'";
                                } else {
                                    value = "datetime'" + value.toISOString().substring(0, 23) + "'";
                                }
                            }

                            else if (typeof value == "number") {
                                value = value;
                            }

                            else if (typeof value == "boolean") {
                                value = value;
                            } else {
                                value = "'" + value + "'";
                            }

                        } else {
                            if (value instanceof Date) {
                                value = value.toISOString();
                                if (eType == "date") {
                                    value = value + "@@date";
                                }
                                else if (eType == "time" || eType == "time-local") {
                                    value = value + "@@time";
                                }
                                else {
                                    value = value + "@@datetime";
                                }
                            }

                            else if (typeof value == "number") {
                                value = value + "@@number";
                            }

                            else if (typeof value == "boolean") {
                                value = value + "@@boolean";
                            }

                        }
                        var bindedFilter = filterTemplate.split('{value}').join(value);
                        if (typeof value == 'string') {
                            bindedFilter = bindedFilter.split('{value.lower}').join(value.toLowerCase());
                        } else {
                            bindedFilter = bindedFilter.split('{value.lower}').join(value);
                        }
                        if (ngModelCtrl.$viewValue.length == 0)
                            bindedFilter = '';

                        setFilterInButton($element, bindedFilter, operator);
                        if (autopost)
                            makeAutoPostSearch($element, bindedFilter, datasource, attrs);

                    });
                }
                else {
                    if (typeElement == 'text') {
                        $element.on("keyup", function() {
                            var datasource = eval(attrs.crnDatasource);
                            var value = undefined;
                            if (ngModelCtrl && ngModelCtrl != undefined)
                                value = ngModelCtrl.$viewValue;
                            else
                                value = this.value;
                            var bindedFilter = filterTemplate.split('{value}').join(value);
                            if (this.value.length == 0)
                                bindedFilter = '';

                            setFilterInButton($element, bindedFilter, operator);
                            if (autopost)
                                makeAutoPostSearch($element, bindedFilter, datasource, attrs);
                        });
                    }
                    else {
                        $element.on("change", function() {
                            var datasource = eval(attrs.crnDatasource);
                            var value = undefined;
                            var typeElement = $(this).attr('type');
                            if (attrs.asDate != undefined)
                                typeElement = 'date';

                            if (ngModelCtrl && ngModelCtrl != undefined) {
                                value = ngModelCtrl.$viewValue;
                            }
                            else {
                                if (typeElement == 'checkbox')
                                    value = $(this).is(':checked');
                                else if (typeElement == 'date') {
                                    value = this.value;
                                    if (this.value.length > 0) {
                                        var momentDate = moment(this.value, patternFormat(this));
                                        value = momentDate.toDate().toISOString();
                                    }
                                }
                                else
                                    value = this.value;
                            }
                            var bindedFilter = filterTemplate.split('{value}').join(value);
                            if (value.toString().length == 0)
                                bindedFilter = '';

                            setFilterInButton($element, bindedFilter, operator);
                            if (autopost)
                                makeAutoPostSearch($element, bindedFilter, datasource, attrs);
                        });
                    }
                }
            }

            var	forceDisableDatasource = function(datasourceName, scope) {
                var disableDatasource = setInterval(function() {
                    try {
                        var datasourceInstance = eval(datasourceName);
                        if (datasourceInstance) {
                            $(document).ready(function() {
                                var time = 0;
                                var intervalForceDisable = setInterval(function() {
                                    if (time < 10) {
                                        scope.$apply(function () {
                                            datasourceInstance.enabled = false;
                                            datasourceInstance.data = [];
                                        });
                                        time++;
                                    }
                                    else
                                        clearInterval(intervalForceDisable);
                                }, 20);
                            });
                            clearInterval(disableDatasource);
                        }
                    }
                    catch(e) {
                        //try again, until render
                    }
                },10);
            }

            var buttonBehavior = function(scope, element, attrs, ngModelCtrl, $element, typeElement, operator, autopost) {
                var datasourceName = '';
                if (attrs.crnDatasource)
                    datasourceName = attrs.crnDatasource;
                else
                    datasourceName = $element.parent().attr('crn-datasource');

                var datasource = eval(datasourceName);
                var isOData = datasource.isOData()

                var requiredFilter = attrs.requiredFilter && attrs.requiredFilter.toString() == "true";
                if (requiredFilter) {
                    this.forceDisableDatasource(datasourceName, scope);
                }

                $element.on('click', function() {
                    var $this = $(this);
                    var filters = $this.data('filters');
                    if (datasourceName && datasourceName.length > 0 && filters) {
                        var bindedFilter = '';
                        $(filters).each(function() {
                            if (bindedFilter != '') {
                                bindedFilter += (isOData?" and ":";");
                            }
                            bindedFilter += this.bindedFilter;
                        });

                        var datasourceToFilter = eval(datasourceName);

                        if (requiredFilter) {
                            datasourceToFilter.enabled = bindedFilter.length > 0;
                            if (datasourceToFilter.enabled) {
                                datasourceToFilter.search(bindedFilter, (attrs.cronappFilterCaseinsensitive=="true"));
                            }
                            else {
                                scope.$apply(function () {
                                    datasourceToFilter.data = [];
                                });
                            }
                        }
                        else
                            datasourceToFilter.search(bindedFilter, (attrs.cronappFilterCaseinsensitive=="true"));
                    }
                });
            }

            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, element, attrs, ngModelCtrl) {
                    var $element = $(element);
                    var typeElement = $element.data('type') || $element.attr('type');
                    if (attrs.asDate != undefined)
                        typeElement = 'date';

                    var operator = '=';
                    if (attrs.cronappFilterOperator && attrs.cronappFilterOperator.length > 0)
                        operator = attrs.cronappFilterOperator;

                    var autopost = true;
                    if (attrs.cronappFilterAutopost && attrs.cronappFilterAutopost == "false")
                        autopost = false;

                    //Correção para aceitar datasources fora de ordem
                    setTimeout(function() {
                        if ($element[0].tagName == "INPUT")
                            inputBehavior(scope, element, attrs, ngModelCtrl, $element, typeElement, operator, autopost);
                        else
                            buttonBehavior(scope, element, attrs, ngModelCtrl, $element, typeElement, operator, autopost);
                    }, 100);
                }
            }
        })

        .directive('cronList', ['$compile', function($compile){
            'use strict';

            const TEMPLATE = '\
               <ion-list can-swipe="listCanSwipe"> \
            	   <ion-item class="item" ng-repeat="rowData in datasource"> \
              	   <div class="item-avatar"></div> \
              	 </ion-item> \
               </ion-list> \
               <ion-infinite-scroll></ion-infinite-scroll> \
               ';

            var getExpression = function(dataSourceName) {
                return 'rowData in '.concat(dataSourceName).concat('.data');
            }

            var buildFormat = function(column) {
                var result = '';

                if (column.format) {
                    result = ' | mask: "' + column.format + '"';
                } else {
                    switch (column.type) {
                        case 'date' : result = ' | mask: "date"'; break;
                        case 'datetime' : result = ' | mask: "datetime"'; break;
                        case 'number': result = ' | mask: "number"'; break;
                        case 'money' : result = ' | mask: "money"'; break;
                    }
                }

                return result;
            }

            var addDefaultColumn = function(column, first) {
                var result = null;

                if (first) {
                    result = '<h2>{{rowData.' + column.field + buildFormat(column) + '}}</h2>';
                } else {
                    result = '<p>{{rowData.' + column.field + buildFormat(column) + '}}</p>';
                }

                return result;
            }

            var getEditCommand = function(dataSourceName) {
                return dataSourceName + '.startEditing(rowData)';
            }

            var addDefaultButton = function(dataSourceName, column) {
                const EDIT_TEMPLATE = '<ion-option-button class="button-positive" ng-click="' + getEditCommand(dataSourceName) + '"><i class="icon ion-edit"></i></ion-option-button>';
                const DELETE_TEMPLATE = '<ion-option-button class="button-assertive" ng-click="' + dataSourceName + '.remove(rowData)"><i class="icon ion-trash-a"></i></ion-option-button>';

                if (column.command == 'edit|destroy') {
                    return EDIT_TEMPLATE.concat(DELETE_TEMPLATE);
                } else if (column.command == 'edit') {
                    return EDIT_TEMPLATE;
                } else if (column.command == 'destroy') {
                    return DELETE_TEMPLATE;
                }
            }

            var addImage = function(column) {
                return '<div class="custom-item-avatar-imagem" style="background-image:url(\'data:image/png;base64,{{rowData.' + column.field + '}}\')"></div>';
            }

            var addImageLink = function(column) {
                return '<div class="custom-item-avatar-imagem" style="background-image:url(\'{{rowData.' + column.field + '}}\')"></div>';
            }

            var encodeHTML = function(value) {
                return value.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            }

            var generateBlocklyCall = function(blocklyInfo) {
                var call;
                if (blocklyInfo.type == "client")  {
                    var splitedClass = blocklyInfo.blocklyClass.split('/');
                    var blocklyName = splitedClass[splitedClass.length-1];
                    call = "blockly.js.blockly." + blocklyName;
                    call += "." +  blocklyInfo.blocklyMethod;
                    var params = "()";
                    if (blocklyInfo.blocklyParams.length > 0) {
                        params = "(";
                        blocklyInfo.blocklyParams.forEach(function(p) {
                            params += (p.value ? encodeHTML(p.value) : "''") + ",";
                        }.bind(this))
                        params = params.substr(0, params.length - 1);
                        params += ")";
                    }
                    call += params;
                } else if (blocklyInfo.type == "server") {
                    var blocklyName = blocklyInfo.blocklyClass + ':' + blocklyInfo.blocklyMethod;
                    call = "cronapi.util.makeCallServerBlocklyAsync('"+blocklyName+"',null,null,";
                    if (blocklyInfo.blocklyParams.length > 0) {
                        blocklyInfo.blocklyParams.forEach(function(p) {
                            call += (p.value ? encodeHTML(p.value) : "''") + ",";
                        }.bind(this))
                    }
                    call = call.substr(0, call.length - 1);
                    call += ")";
                }

                return call;
            }

            var addBlockly = function(column) {
                return '<ion-option-button class="button-dark" ng-click="'
                    + generateBlocklyCall(column.blocklyInfo)
                    + '"><i class="icon ion-navigate"></i></ion-option-button>';
            }

            var isImage = function(fieldName, schemaFields) {
                for (var i = 0; i < schemaFields.length; i++) {
                    var field = schemaFields[i];
                    if (fieldName == field.name) {
                        return (field.type == 'Binary');
                    }
                }

                return false;
            }

            var addCustomButton = function(column) {
                return `<ion-option-button class="button-dark" ng-click="listButtonClick($index, rowData, '${window.stringToJs(column.execute)}', $event)"><i class=" ${column.iconClass}"></i> ${column.label}</ion-option-button> `
            }

            var isImage = function(fieldName, schemaFields) {
                for (var i = 0; i < schemaFields.length; i++) {
                    var field = schemaFields[i];
                    if (fieldName == field.name) {
                        return (field.type == 'Binary');
                    }
                }

                return false;
            }

            var getSearchableList = function(dataSourceName, fieldName) {
                return '\
              <label class="item item-input"> <i class="icon ion-search placeholder-icon"></i> \
                <input type="text" ng-model="vars.__searchableList__" cronapp-filter="'+ fieldName +';" cronapp-filter-operator="" cronapp-filter-caseinsensitive="false" cronapp-filter-autopost="true" \
                crn-datasource="' + dataSourceName + '" placeholder="{{\'template.crud.search\' | translate}}"> \
              </label>\
             ';
            }

            return {
                restrict: 'E',
                link: function(scope, element, attrs, ngModelCtrl) {

                    var optionsList = {};
                    var dataSourceName = '';
                    var content = '';
                    var buttons = '';
                    var image = '';
                    try {
                        optionsList = JSON.parse(attrs.options);
                        dataSourceName = optionsList.dataSourceScreen.name;
                        var dataSource = eval(optionsList.dataSourceScreen.name);

                        scope.listButtonClick = function(idx, rowData, fn, event) {

                            dataSource.goTo(rowData);

                            var consolidated = {
                                item: rowData,
                                index: idx
                            }

                            var contextVars = {
                                'currentData': dataSource.data,
                                'datasource': dataSource,
                                'selectedIndex': idx,
                                'index': idx,
                                'selectedRow': rowData,
                                'consolidated': consolidated,
                                'item': rowData,
                                'selectedKeys': dataSource.getKeyValues(dataSource.active, true)
                            };

                            scope.$eval(fn, contextVars);

                            event.preventDefault();
                            event.stopPropagation();
                        }

                        var searchableField = null;
                        var isNativeEdit = false;
                        var addedImage = false;
                        for (var i = 0; i < optionsList.columns.length; i++) {
                            var column = optionsList.columns[i];
                            if (column.visible) {
                                if (column.field && column.dataType == 'Database') {
                                    if (!addedImage && isImage(column.field, optionsList.dataSourceScreen.entityDataSource.schemaFields)) {
                                        image = addImage(column);
                                        addedImage = true;
                                    } else if (!addedImage && (column.type == 'image')) {
                                        image = addImageLink(column);
                                        addedImage = true;                                    
                                    } else {
                                        content = content.concat(addDefaultColumn(column, (i == 0)));
                                        if (column.filterable) {
                                            searchableField = (searchableField != null) ? searchableField + ';' + column.field : column.field;
                                        }
                                    }
                                } else if (column.dataType == 'Command') {
                                    buttons = buttons.concat(addDefaultButton(dataSourceName, column));
                                    if ((column.command == 'edit') || (column.command == 'edit|destroy')) {
                                        isNativeEdit = true;
                                    }
                                } else if (column.dataType == 'Blockly') {
                                    buttons = buttons.concat(addBlockly(column));
                                } else if (column.dataType == 'Customized') {

                                    buttons = buttons.concat(addCustomButton(column));
                                }
                            }
                        }
                    } catch(err) {
                        console.log('CronList invalid configuration! ' + err);
                    }

                    var templateDyn = null;
                    if (searchableField) {
                        templateDyn = $(getSearchableList(dataSourceName, searchableField) + TEMPLATE);
                    } else {
                        templateDyn = $(TEMPLATE);
                    }
                    $(element).html(templateDyn);

                    var ionItem = $(element).find('ion-item');
                    ionItem.attr('ng-repeat', getExpression(dataSourceName));

                    if (isNativeEdit) {
                        ionItem.attr('ng-click', getEditCommand(dataSourceName));
                    }

                    if(attrs.ngClick){
                      ionItem.attr('ng-click', "listButtonClick($index, rowData, \'"+window.stringToJs(attrs.ngClick)+"\', $event)");
                    }

                    const attrsExcludeds = ['options','ng-repeat','ng-click'];
                    const filteredItems = Object.values(attrs.$attr).filter(function(item) {
                      return !attrsExcludeds.includes(item);
                    })
                    for( let o in filteredItems){
                      ionItem.attr(filteredItems[o], attrs[o]);
                    }

                    content = '<div class="item-list-detail">' + content + '<\div>';
                      var ionAvatar = $(element).find('.item-avatar');
                      ionAvatar.append(image);
                      ionAvatar.append(content);
                      ionAvatar.append(buttons);

                    scope.nextPageInfinite = function() {
                        dataSource.nextPage();
                        scope.$broadcast('scroll.infiniteScrollComplete');
                    }

                    var infiniteScroll = $(element).find('ion-infinite-scroll');
                    infiniteScroll.attr('on-infinite', 'nextPageInfinite()');
                    infiniteScroll.attr('distance', '1%');

                    $compile(templateDyn)(scope);
                }
            }
        }])

        .directive('cronInfiniteScroll', ['$compile', function($compile){
            'use strict';
            return {
                restrict: 'EA',
                link: function(scope, element, attrs) {
                    var dataSource = attrs.cronInfiniteScroll ? eval(attrs.cronInfiniteScroll) : attrs.crnDatasource ? eval(attrs.crnDatasource): undefined;
                    if (dataSource) {
                        scope.nextPageInfinite = function() {
                            dataSource.nextPage();
                            scope.$broadcast('scroll.infiniteScrollComplete');
                        }

                        var templateDyn = $('<ion-infinite-scroll></ion-infinite-scroll>');
                        $(element).html(templateDyn);

                        var infiniteScroll = $(element).find('ion-infinite-scroll');
                        infiniteScroll.attr('on-infinite', 'nextPageInfinite()');
                        infiniteScroll.attr('distance', '1%');

                        $compile(templateDyn)(element.scope());
                    }
                }
            }
        }])

        .filter('raw',function($translate) {
            return function(o) {
                if (o != null && o !== undefined) {
                    if (typeof o == 'number') {
                        return o + "";
                    }
                    if (typeof o == 'boolean') {
                        return o + "";
                    }
                    if (o instanceof Date) {
                        var dt = "datetimeoffset'" + o.toISOString() + "'";
                    }
                    else {
                        if (o.length >= 10 && o.match(ISO_PATTERN)) {
                            return "datetimeoffset'" + o + "'";
                        } else {
                            return "'" + o + "'";
                        }
                    }
                } else {
                    return "";
                }
            }
        })

        .directive('xkeyField', ['$compile', function($compile){
            'use strict';
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    if (attrs.xkeyField && attrs.xdisplayField) {
                        var dataSource = '';
                        if (attrs.crnDatasource) {
                            dataSource = attrs.crnDatasource;
                        }

                        var ngOptions;
                        element.removeAttr('xkey-field');
                        element.removeAttr('xdisplay-field');
                        if (attrs.multiple) {
                            ngOptions = 'opt as opt.' + attrs.xdisplayField + ' for opt in ' + dataSource + '.data track by opt.' + attrs.xkeyField;
                            element.attr('ng-options', ngOptions);
                        } else {
                            element.append('<option ng-repeat="opt in ' + dataSource + '.data" value="{{opt.' + attrs.xkeyField  + '}}">{{opt.' + attrs.xdisplayField + '}}</option>');
                        }

                        $compile($(element))(scope);
                    }
                }
            }
        }])

}(app));


function maskDirectiveAsDate($compile, $translate) {
    return maskDirective($compile, $translate, 'as-date');
}

function maskDirectiveMask($compile, $translate) {
    return maskDirective($compile, $translate, 'mask');
}

function maskDirective($compile, $translate, attrName) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if(attrName == 'as-date' && attrs.mask !== undefined)
                return;


            var $element = $(element);

            var type = $element.attr("type");

            if (type == "checkbox" || type == "password")
                return;

            $element.data("type", type);

            $element.attr("type", "text");

            if (ngModelCtrl) {
                ngModelCtrl.$formatters = [];
                ngModelCtrl.$parsers = [];
            }

            if (attrs.asDate !== undefined && type == 'text')
                type = "date";

            var textMask = true;

            var removeMask = false;

            var attrMask = attrs.mask || attrs.format;

            if (!attrMask) {
                attrMask = parseMaskType(type, $translate);
            } else {
                attrMask = parseMaskType(attrMask, $translate);
            }

            if (attrMask.endsWith(";0")) {
                removeMask = true;
            }

            var mask = attrMask.replace(';1', '').replace(';0', '').trim();
            if (mask == undefined || mask.length == 0) {
                return;
            }

            if (type == 'date' || type == 'datetime' || type == 'datetime-local' || type == 'month' || type == 'time' || type == 'time-local' || type == 'week') {
                var useUTC = type == 'date' || type == 'datetime' || type == 'time';
                if(type == 'date'){
                    mask = moment.HTML5_FMT.DATE;
                    $element.attr("type", "date");
                }
                else if(type == 'month'){
                    mask = moment.HTML5_FMT.MONTH;
                    $element.attr("type", "month");
                }else if( type == 'week'){
                    mask = moment.HTML5_FMT.WEEK;
                    $element.attr("type", "week");
                }else if(  type == 'datetime' || type == 'datetime-local' ){
                    mask = moment.HTML5_FMT.DATETIME_LOCAL;
                    $element.attr("type", "datetime-local");
                }else if( type == 'time' || type == 'time-local'  ){
                    mask = moment.HTML5_FMT.TIME;
                    $element.attr("type", "time");
                }

                if (ngModelCtrl) {
                    ngModelCtrl.$formatters.push(function (value) {

                        if(value){
                            if(useUTC){
                                return moment.utc(value).format(mask);
                            }
                            return moment(value).format(mask);
                        }else{
                            return null;
                        }
                    });

                    ngModelCtrl.$parsers.push(function (value) {
                        if (value) {
                            if(useUTC){
                                return moment.utc(value, mask).toDate();
                            }
                            return moment(value,mask).toDate();
                        }
                        return new Date(value);
                    });
                }

            } else if (type == 'number' || type == 'money' || type == 'integer' || type == 'money-decimal') {
                removeMask = true;
                textMask = false;

                var currency = mask.trim().replace(/\./g, '').replace(/\,/g, '').replace(/#/g, '').replace(/0/g, '').replace(/9/g, '');

                var prefix = '';
                var suffix = '';
                var thousands = '';
                var decimal = ',';
                var precision = 0;

                if (mask.startsWith(currency)) {
                  prefix = currency;
                }
                else if (mask.endsWith(currency)) {
                  suffix = currency;
                }

                var pureMask = mask.trim().replace(prefix, '').replace(suffix, '').trim();

                if (pureMask.startsWith("#.")) {
                    thousands = '.';
                }
                else if (pureMask.startsWith("#,")) {
                    thousands = ',';
                }

                var dMask = null;

                if (pureMask.indexOf(",0") != -1) {
                    decimal = ',';
                    dMask = ",0";
                }
                else if (pureMask.indexOf(".0") != -1) {
                    decimal = '.';
                    dMask = ".0";
                }

                if (dMask != null) {
                    var strD = pureMask.substring(pureMask.indexOf(dMask) + 1);
                    precision = strD.length;
                }


                var inputmaskType = 'numeric';

                if (precision == 0)
                    inputmaskType = 'integer';

                if(type == 'money-decimal'){
                  inputmaskType = 'currency';
                }

                var ipOptions = {
                  'rightAlign':  (type == 'money' || type == 'money-decimal'),
                  'unmaskAsNumber': true,
                  'allowMinus': true,
                  'prefix': prefix,
                  'suffix': suffix,
                  'radixPoint': decimal,
                  'digits': precision,
                  'numericInput' :  (type == 'money-decimal')
                };

                if (thousands) {
                    ipOptions['autoGroup'] = true;
                    ipOptions['groupSeparator'] = thousands;
                }

                $(element).inputmask(inputmaskType, ipOptions);

                var unmaskedvalue = function() {
                    $(this).data('rawvalue',$(this).inputmask('unmaskedvalue'));
                };
                $(element).off("keypress");
                scope.safeApply(function(){
                    $(element).on('keyup',unmaskedvalue);
                });
                if (ngModelCtrl) {
                    ngModelCtrl.$formatters.push(function (value) {
                        if (value != undefined && value != null && value !== '') {
                            return format(mask, value);
                        }
                        return null;
                    });
                    ngModelCtrl.$parsers.push(function (value) {
                        if (value != undefined && value != null && value !== '') {
                            var unmaskedvalue = $element.inputmask('unmaskedvalue');
                            if (unmaskedvalue !== '')
                                return unmaskedvalue;
                        }
                        return null;
                    });
                }
            }

            else if (type == 'text' || type == 'tel') {

                var options = {};
                if (attrs.maskPlaceholder) {
                    options.placeholder = attrs.maskPlaceholder
                }

                $element.mask(mask, options);

                var unmaskedvalue = function() {
                    if (removeMask)
                        $(this).data('rawvalue',$(this).cleanVal());
                }
                $(element).on('keydown', unmaskedvalue).on('keyup', unmaskedvalue);

                if (removeMask && ngModelCtrl) {
                    ngModelCtrl.$formatters.push(function (value) {
                        if (value) {
                            return $element.masked(value);
                        }

                        return null;
                    });

                    ngModelCtrl.$parsers.push(function (value) {
                        if (value) {
                            return $element.cleanVal();
                        }

                        return null;
                    });
                }
            }
        }
    }
}

function parseMaskType(type, $translate) {
    if (type == "datetime" || type == "datetime-local") {
        type = $translate.instant('Format.DateTime');
        if (type == 'Format.DateTime')
            type = 'DD/MM/YYYY HH:mm:ss'
    }

    else if (type == "date") {
        type = $translate.instant('Format.Date');
        if (type == 'Format.Date')
            type = 'DD/MM/YYYY'
    }

    else if (type == "time" || type == "time-local") {
        type = $translate.instant('Format.Hour');
        if (type == 'Format.Hour')
            type = 'HH:mm:ss'
    }

    else if (type == "month") {
        type = 'MMMM';
    }

    else if (type == "number") {
        type = $translate.instant('Format.Decimal');
        if (type == 'Format.Decimal')
            type = '0,00'
    }

    else if (type == "money" || type == "money-decimal") {
        type = $translate.instant('Format.Money');
        if (type == 'Format.Money')
            type = '#.#00,00'
    }

    else if (type == "integer") {
        type = '0';
    }

    else if (type == "week") {
        type = 'dddd';
    }

    else if (type == "tel") {
        type = '(00) 00000-0000;0';
    }

    else if (type == "text") {
        type = '';
    }

    return type;
}
