import {TabulatorFull as Tabulator} from "tabulator-tables";
import {el} from "redom";
import JQuery from "jquery";
import {
    pick,
    defaults,
    startCase,
    lowerCase,
    upperCase,
    kebabCase,
    snakeCase,
    debounce,
    mapValues,
} from "lodash";

export default function useTabulator(config) {
    Tabulator.extendModule("format", "formatters", {
        actions: function(cell, formatterParams) {
            const data = cell.getData(),
                defaultClass = "btn btn-primary";

            if (!Array.isArray(formatterParams)) {
                return el('a', {
                    class: defaultClass,
                    href: window.location + '/' + data.id,
                }, 'View')
            }

            const buttons = formatterParams
                .map((element) => {
                    const settings = mapValues(element, (value, attribute) => {
                        if (typeof value !== 'function') {
                            return value;
                        }

                        if (attribute.startsWith('on')) {
                            return (event) => {
                                value(event, cell);
                            }
                        }

                        return value(cell.getValue(), data, cell)
                    });

                    const { tag, label, ...attributes } = defaults(settings, {
                        tag: 'button',
                        label: cell.getValue(),
                        class: defaultClass,
                        hidden: false,
                    });

                    return el(tag, attributes, label);
                })
                .filter((element) => !!element && !element.hidden);

            if (buttons.length === 0) {
                return null;
            }

            return el('div', { class: 'btn-group' }, buttons);
        },
        link: function(cell, formatterParams) {
            const value = formatterParams.url ?? cell.getValue(),
                urlPrefix = formatterParams.prefix ?? '',
                urlSuffix = formatterParams.suffix ?? '',
                urlBody = typeof value === 'function' ? value(cell.getValue(), cell.getData()) : value,
                fullUrl = `${urlPrefix}${urlBody}${urlSuffix}`,
                text = formatterParams.text ?? value,
                options = defaults(
                    { href: fullUrl }, 
                    pick(formatterParams, [ 'target', 'class', 'style' ]), 
                    { target: '_blank' }
                );

            if (! urlBody) {
                return text;
            }

            return el('a', options, text);
        },
        image: function(cell, formatterParams) {
            const value = formatterParams.url ?? cell.getValue(),
                urlPrefix = formatterParams.urlPrefix ?? '',
                urlSuffix = formatterParams.urlSuffix ?? '',
                urlBody = typeof value === 'function' ? value(cell.getValue(), cell.getData()) : value,
                fullUrl = `${urlPrefix}${urlBody}${urlSuffix}`,
                options = defaults({
                    alt: cell.getField() ?? 'Image',
                    src: fullUrl,
                }, pick(formatterParams, [
                    'width',
                    'height',
                    'style',
                    'class',
                    'alt',
                ]));

            if (! urlBody) {
                return '';
            }

            return el('div', { class: 'img-thumbnail w-100 h-100 overflow-hidden' }, el('img', options));
        },
        list: function(cell, formatterParams) {
            const params = defaults({ separator: ',' }, formatterParams),
                value = cell.getValue();

            return Array.isArray(value) ? value.join(params.separator) : value;
        },
        startCase: function(cell, formatterParams) {
            const value = cell.getValue(),
                options = defaults(formatterParams, { lower: true });

            return startCase(options.lower ? lowerCase(value) : value);
        },
        lowerCase: function(cell, formatterParams) {
            return lowerCase(cell.getValue());
        },
        upperCase: function(cell, formatterParams) {
            return upperCase(cell.getValue());
        },
        kebabCase: function(cell, formatterParams) {
            return kebabCase(cell.getValue());
        },
        snakeCase: function(cell, formatterParams) {
            return snakeCase(cell.getValue());
        },
    });

    Tabulator.extendModule("filter", "filters", {
        minMax: function(headerValue, rowValue) {
            if (!headerValue) {
                return true;
            }

            if (headerValue.min && headerValue.max) {
                return rowValue >= headerValue.min && rowValue <= headerValue.max;
            }

            if (headerValue.min) {
                return rowValue >= headerValue.min;
            }

            if (headerValue.max) {
                return rowValue <= headerValue.max;
            }
        },
        textSearch: function(headerValue, rowValue) {
            if (!headerValue || !headerValue.query) {
                return true;
            }

            if (headerValue.type === 'contains') {
                return rowValue.toLowerCase().includes(headerValue.query.toLowerCase());
            } else if (headerValue.type === 'startsWith') {
                return rowValue.toLowerCase().startsWith(headerValue.query.toLowerCase());
            } else if (headerValue.type === 'endsWith') {
                return rowValue.toLowerCase().endsWith(headerValue.query.toLowerCase());
            } else {
                return rowValue === headerValue.query;
            }
        }
    });

    Tabulator.extendModule("edit", "editors", {
        minMax: function(cell, onRendered, success, cancel) {
            const min = el("input.form-control.form-control-sm", {
                    type: "number",
                    value: cell.getValue().min || '',
                    placeholder: "Min",
                }),
                max = el("input.form-control.form-control-sm", {
                    type: "number",
                    value: cell.getValue().max || '',
                    placeholder: "Max",
                }),
                container = el("div", [
                    el('div.md-form.md-outline.form-sm.mb-1', min),
                    el('div.md-form.md-outline.form-sm.mt-1', max),
                ]),
                sendValues = debounce(function () {
                    if (min.value || max.value) {
                        success({
                            min: min.value,
                            max: max.value,
                        });
                    } else {
                        cancel();
                    }
                }, 600),
                cancelValues = debounce(function (e) {
                    e.target.value = '';
                    cancel();
                }, 600),
                keypress = function(e) {
                    if (e.key === 'Escape') {
                        cancelValues(e);
                    } else {
                        sendValues();
                    }
                };

            min.onchange = sendValues;
            min.onblur = sendValues;
            min.onkeydown = keypress;

            max.onchange = sendValues;
            max.onblur = sendValues;
            max.onkeydown = keypress;

            return container;
        },
        textSearch: function(cell, onRendered, success, cancel) {
            const type = cell.getValue().type || 'contains',
                select = el('select', [
                    el('option', { value: 'contains', selected: type === 'contains' }, 'Contains'),
                    el('option', { value: 'starts', selected: type === 'starts' }, 'Starts'),
                    el('option', { value: 'ends', selected: type === 'ends' }, 'Ends'),
                    el('option', { value: 'exact', selected: type === 'exact' }, 'Exact'),
                ]),
                input = el('input', {
                    type: "text",
                    value: cell.getValue().query || '',
                    placeholder: "Value",
                }),
                sendValues = debounce(function () {
                    if (input.value) {
                        success({
                            type: select.value,
                            query: input.value,
                        });
                    } else {
                        cancel();
                    }
                }, 600),
                cancelValues = debounce(function () {
                    input.value = '';
                    cancel();
                }, 600);

            select.onchange = sendValues;
            input.onchange = sendValues;
            input.onblur = sendValues;
            input.onkeydown = function(e) {
                if (e.key === 'Escape') {
                    cancelValues();
                } else {
                    sendValues();
                }
            };

            return el('div', [
                select,
                input
            ]);
        },
    });

    if (config?.extend && typeof config.extend === 'function') {
        config.extend(Tabulator);
    }

    if (config?.modules) {
        for (const name in config.modules) {
            for (const property in config.modules[name]) {
                if (! config.modules[name][property]) {
                    continue;
                }

                Tabulator.extendModule(name, property, config.modules[name][property]);
            }
        }
    }

    if (config?.persistence?.hasOwnProperty('saveUrl')) {
        Tabulator.extendModule("persistence", "writers", {
            remote: function(id, type, data) {
                const persistenceUrl = config.persistence.saveUrl instanceof Function
                    ? config.persistence.saveUrl(id, type, data)
                    : config.persistence.saveUrl;

                if (type === 'filter') {
                    data = {
                        headerFilters: this.table.getHeaderFilters(),
                        filters: data,
                    };
                }

                axios.post(persistenceUrl, {
                    id,
                    type,
                    data,
                });
            },
        });
    }

    if (config?.persistence?.hasOwnProperty('loadUrl')) {
        Tabulator.extendModule("persistence", "readers", {
            remote: function (id, type) {
                const persistenceUrl = config.persistence.loadUrl instanceof Function
                    ? config.persistence.loadUrl(id, type)
                    : config.persistence.loadUrl;

                let persistenceData = null;

                JQuery.ajax({
                    async: false,
                    dataType: 'json',
                    url: persistenceUrl,
                    success: ({type, data}) => {
                        persistenceData = type === 'filter' ? data?.filters : data;

                        if (type === 'filter') {
                            const headerFilters = data?.headerFilters ?? [];

                            headerFilters.forEach(({field, value}) => this.table.setHeaderFilterValue(field, value));
                        }
                    }
                });

                return persistenceData;
            },
        });
    }

    return {
        Tabulator,
    }
};
