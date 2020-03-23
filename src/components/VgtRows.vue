<template>
  <fragment v-if="row">
    <tr
      v-show="displayed"
      :key="row.originalIndex"
      :class="rowClasses"
      @mouseenter="onMouseenter(row, index)"
      @mouseleave="onMouseleave(row, index)"
      @dblclick="onRowDoubleClicked(row, index, $event)"
      @click="onRowClicked(row, index, $event)"
      @auxclick="onRowAuxClicked(row, index, $event)"
    >
      <th v-if="lineNumbers" class="line-numbers">{{ getCurrentIndex(index) }}</th>
      <th
        v-if="selectable"
        @click.stop="onCheckboxClicked(row, index, $event)"
        class="vgt-checkbox-col"
      >
        <input type="checkbox" :checked="row.vgtSelected" />
        <span v-if="row.children" @click="toggleExpand()" class="expand"></span>
      </th>
      <td
        @click="onCellClicked(row, column, index, $event)"
        v-for="(column, i) in columns"
        :key="i"
        :class="getClasses(i, 'td', row)"
        v-if="!column.hidden && column.field"
      >
        <slot
          name="table-row"
          :row="row"
          :column="column"
          :formattedRow="formattedRow(row)"
          :index="index"
        >
          <span v-if="!column.html">{{ collectFormatted(row, column) }}</span>
          <span v-if="column.html" v-html="collect(row, column.field)"></span>
        </slot>
      </td>
    </tr>
    <vgt-rows
      v-if="row.children && row.children.length"
      v-for="(child, index) in row.children"
      :row="child"
      :key="`row-${index}`"
      :level="level + 1"
      :displayed="expanded && displayed"
      :groupHeaderOnTop="groupHeaderOnTop"
      :groupHeaderOnBottom="groupHeaderOnBottom"
      :columns="columns"
      :line-numbers="lineNumbers"
      :selectable="selectable"
      :groupOptions="groupOptions"
      :collect-formatted="collectFormatted"
      :formatted-row="formattedRow"
      :get-classes="getClasses"
      :full-colspan="fullColspan"
      :hasHeaderRowTemplate="hasHeaderRowTemplate"
      :rowClass="rowClass"
      @on-row-mouseenter="onMouseenter(child, index)"
      @on-row-mouseleave="onMouseleave(child, index)"
      @on-row-dblclick="onRowDoubleClicked(child, index, $event)"
      @on-row-click="onRowClicked(child, index, $event)"
      @on-row-aux-click="onRowAuxClicked(child, index, $event)"
      @on-checkbox-clicked="onCheckboxClicked(child, index, $event)"
      @on-cell-clicked="onCellClicked(child, index, $event)"
    ></vgt-rows>
  </fragment>
</template>

<script>
import { Fragment } from "vue-fragment";
import number from "./types/number";
import VgtHeaderRow from "./VgtHeaderRow.vue";

export default {
  name: "VgtRows",
  data() {
    return { expanded: true };
  },
  props: {
    row: {},
    index: 1,
    level: { default: 1 },
    displayed: { default: true },
    groupHeaderOnTop: {},
    groupHeaderOnBottom: {},
    columns: {},
    "line-numbers": {},
    selectable: {},
    groupOptions: {},
    "collect-formatted": {},
    "formatted-row": {},
    "get-classes": {},
    "full-colspan": {},
    hasHeaderRowTemplate: {},
    rowClass: {}
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },

    onMouseenter(row, index) {
      this.$emit("on-row-mouseenter", {
        row,
        pageIndex: index
      });
    },

    onMouseleave(row, index) {
      this.$emit("on-row-mouseleave", {
        row,
        pageIndex: index
      });
    },

    onRowDoubleClicked(row, index, event) {
      this.$emit("on-row-dblclick", {
        row,
        pageIndex: index,
        selected: !!row.vgtSelected,
        event
      });
    },

    onRowClicked(row, index, event) {
      this.$emit("on-row-click", {
        row,
        pageIndex: index,
        selected: !!row.vgtSelected,
        event
      });
    },

    onRowAuxClicked(row, index, event) {
      this.$emit("on-row-aux-click", {
        row,
        pageIndex: index,
        selected: !!row.vgtSelected,
        event
      });
    },

    onCellClicked(row, column, rowIndex, event) {
      this.$emit("on-cell-click", {
        row,
        column,
        rowIndex,
        event
      });
    },

    onCheckboxClicked(row, index, event) {
      this.$emit("on-checkbox-clicked", {
        row,
        pageIndex: index,
        selected: !!row.vgtSelected,
        event
      });
    }
  },
  computed: {
    rowClasses() {
      return [...this.rowClass, `level-${this.level}`];
    }
  },
  components: {
    Fragment,
    "vgt-header-row": VgtHeaderRow
  }
};
</script>