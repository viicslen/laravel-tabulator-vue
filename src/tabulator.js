import {TabulatorFull as Tabulator} from "tabulator-tables";
import {el} from "redom";
import {debounce} from "lodash";
import JQuery from "jquery";

export default function useTabulator(settings) {
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

    if (settings && settings.hasOwnProperty('persistence') && settings.persistance.hasOwnProperty('saveUrl')) {
        Tabulator.extendModule("persistence", "writers", {
            remote: function(id, type, data) {
                const persistenceUrl = settings.persistence.saveUrl instanceof Function
                    ? settings.persistence.saveUrl(id, type, data)
                    : settings.persistence.saveUrl;

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

    if (settings && settings.hasOwnProperty('persistence') && settings.persistance.hasOwnProperty('loadUrl')) {
        Tabulator.extendModule("persistence", "readers", {
            remote: function (id, type) {
                const persistenceUrl = settings.persistence.loadUrl instanceof Function
                    ? settings.persistence.loadUrl(id, type)
                    : settings.persistence.loadUrl;

                let persistenceData = null;

                JQuery.ajax({
                    async: false,
                    dataType: 'json',
                    url: persistenceUrl,
                    success: ({type, data}) => {
                        if (type === 'filter') {
                            const headerFilters = data.headerFilters ? data.headerFilters : [];

                            headerFilters.forEach(({field, value}) => this.table.setHeaderFilterValue(field, value));
                            persistenceData = data.filters ? data.filters : null;
                        } else {
                            persistenceData = data;
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
