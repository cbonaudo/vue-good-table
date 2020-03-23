<template>
  <fragment v-if="row">
    <fragment v-if="row.children && row.children.length">
      <!-- if group row header is at the top -->
      <vgt-header-row
        v-if="groupHeaderOnTop"
        v-show="displayed"
        @vgtExpand="toggleExpand()"
        :header-row="row"
        :columns="columns"
        :line-numbers="lineNumbers"
        :selectable="selectable"
        :collapsable="groupOptions.collapsable"
        :collect-formatted="collectFormatted"
        :formatted-row="formattedRow"
        :get-classes="getClasses"
        :full-colspan="fullColspan"
      >
        <template v-if="hasHeaderRowTemplate" slot="table-header-row" slot-scope="props">
          <slot
            name="table-header-row"
            :column="props.column"
            :formattedRow="props.formattedRow"
            :row="props.row"
          ></slot>
        </template>
      </vgt-header-row>

      <vgt-row-hierarchy
        v-for="(child, index) in row.children"
        :row="child"
        :key="index"
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
      ></vgt-row-hierarchy>
      <!-- if group row header is at the bottom -->
      <vgt-header-row
        v-if="groupHeaderOnBottom"
        v-show="displayed"
        :header-row="headerRow"
        :columns="columns"
        :line-numbers="lineNumbers"
        :selectable="selectable"
        :collect-formatted="collectFormatted"
        :formatted-row="formattedRow"
        :get-classes="getClasses"
        :full-colspan="fullColspan"
      >
        <template v-if="hasHeaderRowTemplate" slot="table-header-row" slot-scope="props">
          <slot
            name="table-header-row"
            :column="props.column"
            :formattedRow="props.formattedRow"
            :row="props.row"
          ></slot>
        </template>
      </vgt-header-row>
    </fragment>
    <fragment v-else>
      <tr
        v-if="displayed"
        :key="row.originalIndex"
        :class="rowClass"
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
    </fragment>
  </fragment>
</template>

<script>
import { Fragment } from "vue-fragment";
import number from "./types/number";
import VgtHeaderRow from "./VgtHeaderRow.vue";

export default {
  name: "VgtRowHierarchy",
  data() {
    return { expanded: true };
  },
  props: {
    row: {},
    index: 1,
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
    // -- End Child
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
      if (this.selectable && !this.selectOnCheckboxOnly) {
        this.$set(row, "vgtSelected", !row.vgtSelected);
      }
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
    }
  },
  components: {
    Fragment,
    "vgt-header-row": VgtHeaderRow
  }
};
</script>