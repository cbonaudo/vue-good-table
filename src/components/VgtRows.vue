<template>
  <tr v-if="isExpanded">
    <td :colspan="fullColspan" class="table-container">
      <table :class="tableStyleClasses">
        <tbody :class="[`depth-${this.depth}`, {'depth-is-expanded': row.vgtIsExpanded}]">
          <tr
            :key="row.originalIndex"
            :class="getRowStyleClass(row)"
            @mouseenter="onMouseenter(row, index)"
            @mouseleave="onMouseleave(row, index)"
            @dblclick="onRowDoubleClicked(row, index, $event)"
            @click="onRowClicked(row, index, $event)"
            @auxclick="onRowAuxClicked(row, index, $event)"
          >
            <th v-if="lineNumbers" class="line-numbers">{{ getCurrentIndex(index) }}</th>
            <th v-if="selectable" class="vgt-checkbox-col">
              <slot
                name="checkbox"
                :expanded="row.vgtIsExpanded"
                :onClick="() => columnCollapsable(-1)
                    ? toggleExpand()
                    : onCellClicked(row, column, index, $event)"
                :selectRow="() => selectRow(row, index, $event)"
                :row="row"
                :index="index"
                :show-triangle="columnCollapsable(-1) && hasChildren"
                :allSelected="allSelected"
                :almostAllSelected="almostAllSelected"
              >
                <span
                  v-if="columnCollapsable(-1) && hasChildren"
                  class="triangle"
                  :class="{ expand: row.vgtIsExpanded }"
                  @click="
                    columnCollapsable(-1)
                      ? toggleExpand()
                      : onCellClicked(row, column, index, $event)
                  "
                ></span>

                <input
                  type="checkbox"
                  @click="selectRow(row, index, $event)"
                  :aria-label="`toggle select ${row.name}`"
                  :checked="allSelected"
                  :indeterminate.prop="almostAllSelected"
                />
              </slot>
            </th>
            <td
              v-for="(column, i) in columns"
              :key="i"
              :class="getClasses(i, 'td', row)"
              v-if="!column.hidden && column.field"
              @click="
                columnCollapsable(i)
                  ? toggleExpand()
                  : onCellClicked(row, column, index, $event)
              "
            >
              <span
                v-if="columnCollapsable(i) && hasChildren"
                class="triangle"
                :class="{ expand: row.vgtIsExpanded }"
              ></span>
              <slot
                name="table-row"
                :row="row"
                :column="column"
                :formattedRow="formattedRow(row)"
                :index="index"
              ></slot>
            </td>
          </tr>
          <vgt-rows
            v-if="hasChildren"
            v-for="(childRow, childIndex) in row.children"
            :key="childIndex + childRow.name"
            :index="childIndex"
            :headerRow="row"
            :row="childRow"
            :hasHeader="hasHeader"
            :groupOptions="groupOptions"
            :getRowStyleClass="getRowStyleClass"
            :getClasses="getClasses"
            :tableStyleClasses="tableStyleClasses"
            :lineNumbers="lineNumbers"
            :selectable="selectable"
            :columns="columns"
            :collectFormatted="collectFormatted"
            :fullColspan="fullColspan"
            :formattedRow="formattedRow"
            :getCurrentIndex="getCurrentIndex"
            :onMouseenter="onMouseenter"
            :onMouseleave="onMouseleave"
            :onRowDoubleClicked="onRowDoubleClicked"
            :onRowClicked="onRowClicked"
            :onRowAuxClicked="onRowAuxClicked"
            :onCheckboxClicked="onCheckboxClicked"
            :onCellClicked="onCellClicked"
            :depth="increaseDepth"
          >
            <template #table-row="props">
              <slot
                name="table-row"
                :row="props.row"
                :column="props.column"
                :formattedRow="formattedRow(props.row)"
                :index="props.index"
              >
                <span v-if="!props.column.html">{{ collectFormatted(props.row, props.column) }}</span>
                <span v-if="props.column.html" v-html="collect(props.row, column.field)"></span>
              </slot>
            </template>
            <template #checkbox="props">
              <slot name="checkbox" v-bind="props" />
            </template>
          </vgt-rows>
        </tbody>
      </table>
    </td>
  </tr>
</template>

<script>
import {
  recursiveHasRowUnselected,
  recursiveHasRowSelected,
  recursiveSelect
} from "./utils/recursive";

export default {
  name: "VgtRows",
  props: {
    depth: { type: Number, default: 1},
    headerRow: {},
    row: {},
    index: {},
    hasHeader: {},
    groupOptions: {},
    getRowStyleClass: {},
    lineNumbers: {},
    selectable: {},
    columns: {},
    getClasses: {},
    tableStyleClasses: {},
    collectFormatted: {},
    formattedRow: {},
    fullColspan: {},
    getCurrentIndex: {},
    onMouseenter: {},
    onMouseleave: {},
    onRowDoubleClicked: {},
    onRowClicked: {},
    onRowAuxClicked: {},
    onCheckboxClicked: {},
    onCellClicked: {}
  },
  watch: {
    row: {
      deep: true,
      handler() {
        this.$set(this.row, "vgtSelected", this.allSelected);
      }
    }
  },
  methods: {
    columnCollapsable: function(currentIndex) {
      if (this.groupOptions.collapsable === true) {
        return currentIndex === 0;
      }
      return currentIndex === this.groupOptions.collapsable;
    },

    toggleExpand() {
      this.$set(this.row, "vgtIsExpanded", !this.row.vgtIsExpanded);
    },
    selectRow(row, index, event) {
      this.onCheckboxClicked(row, index, event);
      if (this.row.children) {
        if (this.allSelected) {
          recursiveSelect(this.row.children, false, this.$set);
        } else {
          recursiveSelect(this.row.children, true, this.$set);
        }
        this.row.vgtSelected = this.allSelected;
      }
    }
  },
  computed: {
    hasChildren() {
      return this.row.children && this.row.children.length;
    },
    allSelected() {
      if (this.row.children) {
        return !recursiveHasRowUnselected(this.row);
      } else {
        return this.row.vgtSelected;
      }
    },
    almostAllSelected() {
      if (this.row.children && !this.allSelected) {
        return recursiveHasRowSelected(this.row);
      } else {
        return false;
      }
    },
    increaseDepth() {
      return this.depth + 1;
    },
    isExpanded() {
      if (this.groupOptions.collapsable && !(this.depth === 1 && this.hasHeader === false)) {
        return this.headerRow.vgtIsExpanded
      }
      return true;
    }
  }
};
</script>
