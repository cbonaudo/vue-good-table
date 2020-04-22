<template>
  <tr v-if="groupOptions.collapsable ? headerRow.vgtIsExpanded : true">
    <td :colspan="fullColspan" class="table-container">
      <table :class="tableStyleClasses">
        <tbody>
          <tr
            :key="row.originalIndex"
            :class="getRowClass"
            @mouseenter="onMouseenter(row, index)"
            @mouseleave="onMouseleave(row, index)"
            @dblclick="onRowDoubleClicked(row, index, $event)"
            @click="onRowClicked(row, index, $event)"
            @auxclick="onRowAuxClicked(row, index, $event)"
          >
            <th v-if="lineNumbers" class="line-numbers">{{ getCurrentIndex(index) }}</th>
            <th v-if="selectable" class="vgt-checkbox-col">
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
              <slot
                name="checkbox"
                :selectRow="selectRow"
                :row="row" 
                :index="index"
                :allSelected="allSelected"
                :almostAllSelected="almostAllSelected"
              >
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
              <slot name="checkbox" :selectRow="props.selectRow" :row="props.row">
              </slot>
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
    getRowClass() {
      return [...this.getRowStyleClass(this.row), `depth-${this.depth}`]
    },
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
    }
  }
};
</script>
