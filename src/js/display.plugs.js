/* ========================================================================
 * ZUI: scroll.js
 * http://zui.sexy
 * ========================================================================
 * Copyright (c) 2014 cnezsoft.com; Licensed MIT
 * ======================================================================== */

!(function($, undefined){
    'use strict';

    if(!$.Display) {
        console.error('display.plugs.js requires display.js');
        return;
    }

    var getSourceElement = function(name, element, oldSource, extraClass, nameClass) {
        var $element = $(element).next('.' + name);
        if(!$element.length) $element = oldSource;
        return $element || '<div class="' + (nameClass || name) + ' ' + (extraClass || '') + '"/>';
    };

    var isUndefinedThen = function(x, y) {
        return x === undefined ? y : x;
    };

    $.Display.plugs({
        dropdown: function(options) {
            var that = this,
                oldSource = options.source;
            return $.extend(options, {
                backdrop: isUndefinedThen(options.backdrop, 'clean'),
                source: options.target ? null : function() {
                    return getSourceElement('dropdown-menu', options.element, oldSource);
                },
                target: isUndefinedThen(options.target, '!new'),
                placement: isUndefinedThen(options.placement, 'beside'),
                activeClass: isUndefinedThen(options.activeClass, 'open'),
                targetDismiss: isUndefinedThen(options.targetDismiss, true)
            });
        },
        popover: function(options) {
            var that = this,
                oldSource = options.source;
            return $.extend(options, {
                arrow: isUndefinedThen(options.arrow, true),
                backdrop: isUndefinedThen(options.backdrop, 'clean'),
                source: options.target ? null : function() {
                    return getSourceElement('popover', options.element, oldSource, 'canvas with-padding');
                },
                target: isUndefinedThen(options.target, '!new'),
                placement: isUndefinedThen(options.placement, 'beside'),
                activeClass: isUndefinedThen(options.activeClass, 'open')
            });
        },
        messager: function(options) {
            var that = this;
            return $.extend(options, {
                autoHide: isUndefinedThen(options.autoHide, true),
                animate: (options.animate === undefined || options.animate === true) ? 'scale-suggest fade' : options.animate,
                // backdrop: isUndefinedThen(options.backdrop, 'clean'),
                closeButton: isUndefinedThen(options.closeButton, true),
                template: function(content, options) {
                    var $messager = $(options.source || '<div class="messager list-item"/>');
                    if(options.icon) $messager.append('<div class="avatar"><i class="icon icon-' + options.icon + '"/></div>');
                    $messager.append('<div class="title">' + content + '</div>');
                    if(options.closeButton) {
                        $messager.append('<button class="btn muted" type="button" data-dismiss="display"><i class="icon icon-remove"></i></button>');
                    }
                    return $messager.addClass(options.type || 'gray');
                },
                target: '!new',
                placement: isUndefinedThen(options.placement, 'bottom-center'),
                activeClass: isUndefinedThen(options.activeClass, 'open')
            });
        },
        modal: function(options) {
            var that = this,
                oldSource = options.source;
            return $.extend(options, {
                backdrop: isUndefinedThen(options.backdrop, 'modal-backdrop fade'),
                source: options.target ? null : function() {
                    return getSourceElement('modal', options.element, oldSource, '', 'box');
                },
                target: isUndefinedThen(options.target, '!new'),
                targetClass: 'modal ' + (options.targetClass || ''),
                placement: isUndefinedThen(options.placement, $.TapName === 'tap' ? 'bottom' : 'center'),
                activeClass: isUndefinedThen(options.activeClass, 'open')
            });
        },
        _collapse: function(options) {
            return $.extend(options, {
                activeClass: isUndefinedThen(options.activeClass, 'open'),
                triggerMethod: 'toggle',
                duration: 200,
                showInClass: 'in',
                activeClass: 'collapse-open',
                group: isUndefinedThen(options.group, options.selector ? ('collapse-group-' + (++$.uuid)) : false),
                checkShow: function(thisOptions) {
                    return thisOptions.selector ? $(thisOptions.element).hasClass('collapse-open') : thisOptions.$target.hasClass('in');
                }
            });
        },
        collapse: function(options) {
            var oldShow = options.show,
                oldHide = options.hide,
                show = function($targets, duration) {
                    $targets.each(function() {
                        var $target = $(this);
                        $target.removeClass('collapse').addClass('collapsing');
                        var height = $target[0].scrollHeight;
                        $target.height(0);
                        setTimeout(function(){
                            $target.height(height);
                            setTimeout(function() {
                                $target.addClass('collapse').removeClass('collapsing').height('');
                            }, duration + 50);
                        }, 10);
                    });
                },
                hide = function($targets, duration) {
                    $targets.each(function() {
                        var $target = $(this);
                        $target.height($target.height())[0].offsetHeight;
                        $target.removeClass('collapse').addClass('collapsing');
                        $target.height(0);
                        setTimeout(function() {
                            $target.removeClass('collapsing in').addClass('collapse').height('');
                        }, duration + 50);
                    });
                };
            return $.extend(options, {
                show: function(thisOptions) {
                    var $target = thisOptions.$target,
                        group = thisOptions.group;
                    if(group) {
                        var $group = group === true ? $target.parent().find('.collapse.in') : $('.collapse.in[data-collapse="' + group + '"]');
                        if($group.length) hide($group.not($target), thisOptions.duration);
                    }
                    show($target, thisOptions.duration);
                    return oldShow && oldShow();
                },
                hide: function(thisOptions) {
                    var $target = thisOptions.$target;
                    hide($target, thisOptions.duration);
                    return oldHide && oldHide();
                }
            });
        }
    });

    $.Display.plugs('_self', function(options) {
        return $.extend(options, {
            trigger: false,
            target: '!self',
            displayAuto: isUndefinedThen(options.displayAuto, true)
        });
    }, 'displaySelf');

    var messager = new $.Display({display: 'messager'});
    messager._show = messager.show;
    messager.show = function(content, options) {
        messager._show($.extend({content: content}, options));
    };
    $.each({
        primary  : 0,
        success  : 'ok-sign',
        info     : 'info-sign',
        warning  : 'warning-sign',
        danger   : 'exclamation-sign',
        important: 0,
        special  : 0
    }, function(name, icon){
        messager[name] = function(content, options) {
            messager._show($.extend({content: content, icon: icon || null, type: name}, options));
        };
    });
    $.messager = messager;
}(CoreLib, undefined));
