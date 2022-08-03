<template>
    <div ref="table"></div>
</template>

<script>
import useTabulator from './tabulator';
import parseFunctionsInObject from './parseFunctions';
import {defaults} from 'lodash';

export default {
    name: "TabulatorTable",
    props: {
        data: {
            type: Array,
            required: false,
            default: () => undefined
        },
        columns: {
            type: Array,
            required: true
        },
        options: {
            type: Object,
            required: false,
            default: () => ({})
        },
        config: {
            type: Object,
            required: false,
            default: () => ({}),
        }
    },
    watch: {
        data: {
            deep: true,
            handler(data, oldData) {
                if (data !== oldData && this.instance) {
                    this.instance.replaceData(data);
                }
            }
        }
    },
    methods: {
        initTable() {
            const {Tabulator} = useTabulator(this.config),
                options = parseFunctionsInObject(defaults(
                    { reactiveData: this.data && this.data.length > 0 },
                    this.options,
                    { columns: this.columns })
                );

            this.instance = new Tabulator(this.$refs.table, {
                ...options,
                data: this.data,
                ajaxResponse: (url, params, response) => {
                    this.$emit('ajax-loaded', response, url, params);

                    return this.options && this.options.ajaxResponse
                        ? this.options.ajaxResponse(url, params, response)
                        : response;
                },
            });

            if (! window.tabulator) {
                window.tabulator = {};
            }

            window.tabulator[this.instance.options.persistenceID || 'tabulator'] = this.instance;
        },
        bindEvents() {
            this.instance.on('dataLoaded', (data) => (this.$emit('data-loaded', data)));
            this.instance.on('tableBuilding', () => (this.$emit('table-building')));
            this.instance.on('tableBuilt', () => (this.$emit('table-built')));
            this.instance.on('headerClick', (e, column) => (this.$emit('header-click', e, column)));
            this.instance.on('headerDblClick', (e, column) => (this.$emit('header-dbl-click', e, column)));
            this.instance.on('headerContext', (e, column) => (this.$emit('header-context', e, column)));
            this.instance.on('headerTap', (e, column) => (this.$emit('header-tap', e, column)));
            this.instance.on('headerDblTap', (e, column) => (this.$emit('header-dbl-tap', e, column)));
            this.instance.on('headerTapHold', (e, column) => (this.$emit('header-tap-hold', e, column)));
            this.instance.on('headerMouseEnter', (e, column) => (this.$emit('header-mouse-enter', e, column)));
            this.instance.on('headerMouseLeave', (e, column) => (this.$emit('header-mouse-leave', e, column)));
            this.instance.on('headerMouseOver', (e, column) => (this.$emit('header-mouse-over', e, column)));
            this.instance.on('headerMouseOut', (e, column) => (this.$emit('header-mouse-out', e, column)));
            this.instance.on('headerMouseMove', (e, column) => (this.$emit('header-mouse-move', e, column)));
            this.instance.on('columnMoved', (column, columns) => (this.$emit('column-moved', column, columns)));
            this.instance.on('columnResized', (column) => (this.$emit('column-resized', column)));
            this.instance.on('columnVisibilityChanged', (column, visible) => (this.$emit('column-visibility-changed', column, visible)));
            this.instance.on('columnTitleChanged', (column) => (this.$emit('column-title-changed', column)));
            this.instance.on('rowClick', (e, row) => (this.$emit('row-click', e, row)));
            this.instance.on('rowDblClick', (e, row) => (this.$emit('row-dbl-click', e, row)));
            this.instance.on('rowContext', (e, row) => (this.$emit('row-context', e, row)));
            this.instance.on('rowTap', (e, row) => (this.$emit('row-tap', e, row)));
            this.instance.on('rowDblTap', (e, row) => (this.$emit('row-dbl-tap', e, row)));
            this.instance.on('rowTapHold', (e, row) => (this.$emit('row-tap-hold', e, row)));
            this.instance.on('rowMouseEnter', (e, row) => (this.$emit('row-mouse-enter', e, row)));
            this.instance.on('rowMouseLeave', (e, row) => (this.$emit('row-mouse-leave', e, row)));
            this.instance.on('rowMouseOver', (e, row) => (this.$emit('row-mouse-over', e, row)));
            this.instance.on('rowMouseOut', (e, row) => (this.$emit('row-mouse-out', e, row)));
            this.instance.on('rowMouseMove', (e, row) => (this.$emit('row-mouse-move', e, row)));
            this.instance.on('rowAdded', (row) => (this.$emit('row-added', row)));
            this.instance.on('rowUpdated', (row) => (this.$emit('row-updated', row)));
            this.instance.on('rowDeleted', (row) => (this.$emit('row-deleted', row)));
            this.instance.on('rowResized', (row) => (this.$emit('row-resized', row)));
            this.instance.on('cellClick', (e, cell) => (this.$emit('cell-click', e, cell)));
            this.instance.on('cellDblClick', (e, cell) => (this.$emit('cell-dbl-click', e, cell)));
            this.instance.on('cellContext', (e, cell) => (this.$emit('cell-context', e, cell)));
            this.instance.on('cellTap', (e, cell) => (this.$emit('cell-tap', e, cell)));
            this.instance.on('cellDblTap', (e, cell) => (this.$emit('cell-dbl-tap', e, cell)));
            this.instance.on('cellTapHold', (e, cell) => (this.$emit('cell-tap-hold', e, cell)));
            this.instance.on('cellMouseEnter', (e, cell) => (this.$emit('cell-mouse-enter', e, cell)));
            this.instance.on('cellMouseLeave', (e, cell) => (this.$emit('cell-mouse-leave', e, cell)));
            this.instance.on('cellMouseOver', (e, cell) => (this.$emit('cell-mouse-over', e, cell)));
            this.instance.on('cellMouseOut', (e, cell) => (this.$emit('cell-mouse-out', e, cell)));
            this.instance.on('cellMouseMove', (e, cell) => (this.$emit('cell-mouse-move', e, cell)));
            this.instance.on('cellEditing', (cell) => (this.$emit('cell-editing', cell)));
            this.instance.on('cellEditCancelled', (cell) => (this.$emit('cell-edit-cancelled', cell)));
            this.instance.on('cellEdited', (cell) => (this.$emit('cell-edited', cell)));
            this.instance.on('dataLoading', (data) => (this.$emit('data-loading', data)));
            this.instance.on('dataLoaded', (data) => (this.$emit('data-loaded', data)));
            this.instance.on('dataLoadError', (error) => (this.$emit('data-load-error', error)));
            this.instance.on('dataProcessing', () => (this.$emit('data-processing')));
            this.instance.on('dataProcessed', () => (this.$emit('data-processed')));
            this.instance.on('dataChanged', (data) => (this.$emit('data-changed', data)));
            this.instance.on('htmlImporting', () => (this.$emit('html-importing')));
            this.instance.on('htmlImported', () => (this.$emit('html-imported')));
            this.instance.on('dataFiltering', (filters) => (this.$emit('data-filtering', filters)));
            this.instance.on('dataFiltered', (filters, rows) => (this.$emit('data-filtered', filters, rows)));
            this.instance.on('dataSorting', (sorters) => (this.$emit('data-sorting', sorters)));
            this.instance.on('dataSorted', (sorters, rows) => (this.$emit('data-sorted', sorters, rows)));
            this.instance.on('renderStarted', () => (this.$emit('render-started')));
            this.instance.on('renderComplete', () => (this.$emit('render-complete')));
            this.instance.on('pageLoaded', (pageNo) => (this.$emit('page-loaded', pageNo)));
            this.instance.on('pageSizeChanged', (pageSize) => (this.$emit('page-size-changed', pageSize)));
            this.instance.on('localized', (locale, lang) => (this.$emit('localized', locale, lang)));
            this.instance.on('groupClick', (e, group) => (this.$emit('group-click', e, group)));
            this.instance.on('groupDblClick', (e, group) => (this.$emit('group-dbl-click', e, group)));
            this.instance.on('groupContext', (e, group) => (this.$emit('group-context', e, group)));
            this.instance.on('groupTap', (e, group) => (this.$emit('group-tap', e, group)));
            this.instance.on('groupDblTap', (e, group) => (this.$emit('group-dbl-tap', e, group)));
            this.instance.on('groupTapHold', (e, group) => (this.$emit('group-tap-hold', e, group)));
            this.instance.on('groupMouseEnter', (e, group) => (this.$emit('group-mouse-enter', e, group)));
            this.instance.on('groupMouseLeave', (e, group) => (this.$emit('group-mouse-leave', e, group)));
            this.instance.on('groupMouseOver', (e, group) => (this.$emit('group-mouse-over', e, group)));
            this.instance.on('groupMouseOut', (e, group) => (this.$emit('group-mouse-out', e, group)));
            this.instance.on('groupMouseMove', (e, group) => (this.$emit('group-mouse-move', e, group)));
            this.instance.on('dataGrouping', () => (this.$emit('data-grouping')));
            this.instance.on('dataGrouped', (groups) => (this.$emit('data-grouped', groups)));
            this.instance.on('groupVisibilityChanged', (group, visible) => (this.$emit('group-visibility-changed', group, visible)));
            this.instance.on('rowSelected', (row) => (this.$emit('row-selected', row)));
            this.instance.on('rowDeselected', (row) => (this.$emit('row-deselected', row)));
            this.instance.on('rowSelectionChanged', (data, rows) => (this.$emit('row-selection-changed', data, rows)));
            this.instance.on('rowMoving', (row) => (this.$emit('row-moving', row)));
            this.instance.on('rowMoved', (row) => (this.$emit('row-moved', row)));
            this.instance.on('rowMoveCancelled', (row) => (this.$emit('row-move-cancelled', row)));
            this.instance.on('movableRowsSendingStart', (toTables) => (this.$emit('movable-rows-sending-start', toTables)));
            this.instance.on('movableRowsSent', (fromRow, toRow, toTable) => (this.$emit('movable-rows-sent', fromRow, toRow, toTable)));
            this.instance.on('movableRowsSentFailed', (fromRow, toRow, toTable) => (this.$emit('movable-rows-sent-failed', fromRow, toRow, toTable)));
            this.instance.on('movableRowsSendingStop', (toTables) => (this.$emit('movable-rows-sending-stop', toTables)));
            this.instance.on('movableRowsReceivingStart', (fromRow, fromTable) => (this.$emit('movable-rows-receiving-start', fromRow, fromTable)));
            this.instance.on('movableRowsReceived', (fromRow, toRow, fromTable) => (this.$emit('movable-rows-received', fromRow, toRow, fromTable)));
            this.instance.on('movableRowsReceivedFailed', (fromRow, toRow, fromTable) => (this.$emit('movable-rows-received-failed', fromRow, toRow, fromTable)));
            this.instance.on('movableRowsReceivingStop', (fromTable) => (this.$emit('movable-rows-receiving-stop', fromTable)));
            this.instance.on('movableRowsElementDrop', (e, element, row) => (this.$emit('movable-rows-element-drop', e, element, row)));
            this.instance.on('validationFailed', (cell, value, validators) => (this.$emit('validation-failed', cell, value, validators)));
            this.instance.on('historyUndo', (action, component, data) => (this.$emit('history-undo', action, component, data)));
            this.instance.on('historyRedo', (action, component, data) => (this.$emit('history-redo', action, component, data)));
            this.instance.on('clipboardCopied', (clipboard) => (this.$emit('clipboard-copied', clipboard)));
            this.instance.on('clipboardPasted', (clipboard, rowData, rows) => (this.$emit('clipboard-pasted', clipboard, rowData, rows)));
            this.instance.on('clipboardPasteError', (clipboard) => (this.$emit('clipboard-paste-error', clipboard)));
            this.instance.on('menuOpened', (component) => (this.$emit('menu-opened', component)));
            this.instance.on('menuClosed', (component) => (this.$emit('menu-closed', component)));
            this.instance.on('popupOpened', (component) => (this.$emit('popup-opened', component)));
            this.instance.on('popupClosed', (component) => (this.$emit('popup-closed', component)));
            this.instance.on('downloadComplete', () => (this.$emit('download-complete')));
            this.instance.on('dataTreeRowExpanded', (row, level) => (this.$emit('data-tree-row-expanded', row, level)));
            this.instance.on('dataTreeRowCollapsed', (row, level) => (this.$emit('data-tree-row-collapsed', row, level)));
            this.instance.on('scrollVertical', (top) => (this.$emit('scroll-vertical', top)));
            this.instance.on('scrollHorizontal', (left) => (this.$emit('scroll-horizontal', left)));
        },
    },
    data: () => ({
        instance: null,
    }),
    mounted() {
        this.initTable();
        this.bindEvents();
    },
    beforeDestroy() {
        this.instance.destroy();
    },
};
</script>
