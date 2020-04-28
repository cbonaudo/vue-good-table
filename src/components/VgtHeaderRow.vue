<template>
  <tr>
    <td
      v-if="headerRow.mode === 'span'"
      class="vgt-left-align vgt-row-header"
      :colspan="fullColspan"
      @click="
        collapsable ? $emit('vgtExpand', !headerRow.vgtIsExpanded) : () => {}
      "
    >
      <span v-if="collapsable" class="triangle" :class="{ expand: headerRow.vgtIsExpanded }"></span>
      <slot :row="headerRow" name="table-header-row">
        <span v-if="headerRow.html" v-html="headerRow.label"></span>
        <span v-else>{{ headerRow.label }}</span>
      </slot>
    </td>
    <!-- if the mode is not span, we display every column -->
    <th class="vgt-row-header" v-if="headerRow.mode !== 'span' && lineNumbers"></th>
    <th class="vgt-row-header" v-if="headerRow.mode !== 'span' && selectable">
      <slot
        name="header-checkbox"
        :selectRow="selectRow"
        :headerRow="headerRow"
        :index="0"
        :allSelected="allSelected"
        :almostAllSelected="almostAllSelected"
        
        :displayArrow="columnCollapsable(-1)"
        :isExpanded="headerRow.vgtIsExpanded"
        :expand="() => columnCollapsable(-1) && $emit('vgtExpand', !headerRow.vgtIsExpanded)"
      >
        <span
          v-if="columnCollapsable(-1)"
          class="triangle"
          :class="{ expand: headerRow.vgtIsExpanded }"
          @click="
            columnCollapsable(-1)
              ? $emit('vgtExpand', !headerRow.vgtIsExpanded)
              : () => {}
          "
        ></span>

        <input
          type="checkbox"
          @click.stop="selectRow(headerRow, 0, $event)"
          :checked="allSelected"
          :aria-label="`toggle select ${headerRow.name}`"
          :indeterminate.prop="almostAllSelected"
        />
      </slot>
    </th>
    <td
      v-if="headerRow.mode !== 'span' && !column.hidden"
      v-for="(column, i) in columns"
      :key="i"
      class="vgt-row-header"
      :class="getClasses(i, 'td')"
      @click="
        columnCollapsable(i)
          ? $emit('vgtExpand', !headerRow.vgtIsExpanded)
          : () => {}
      "
    >
      <span
        v-if="columnCollapsable(i)"
        class="triangle"
        :class="{ expand: headerRow.vgtIsExpanded }"
      ></span>
      <slot
        :row="headerRow"
        :column="column"
        :formattedRow="formattedRow(headerRow, true)"
        name="table-header-row"
      >
        <span v-if="!column.html">{{ collectFormatted(headerRow, column, true) }}</span>
        <span v-if="column.html" v-html="collectFormatted(headerRow, column, true)"></span>
      </slot>
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
  name: "VgtHeaderRow",
  props: {
    headerRow: {
      type: Object
    },
    columns: {
      type: Array
    },
    lineNumbers: {
      type: Boolean
    },
    selectable: {
      type: Boolean
    },
    collapsable: {
      type: [Boolean, Number],
      default: false
    },
    collectFormatted: {
      type: Function
    },
    formattedRow: {
      type: Function
    },
    getClasses: {
      type: Function
    },
    fullColspan: {
      type: Number
    },
    onCheckboxClicked: {
      type: Function
    }
  },
  data() {
    return {};
  },
  watch: {
    headerRow: {
      deep: true,
      handler() {
        this.$set(this.headerRow, "vgtSelected", this.allSelected);
      }
    }
  },
  computed: {
    allSelected() {
      if (this.headerRow.children) {
        return !recursiveHasRowUnselected(this.headerRow);
      } else {
        return this.headerRow.vgtSelected;
      }
    },
    almostAllSelected() {
      if (this.headerRow.children && !this.allSelected) {
        return recursiveHasRowSelected(this.headerRow);
      } else {
        return false;
      }
    }
  },
  methods: {
    columnCollapsable: function(currentIndex) {
      if (this.collapsable === true) {
        return currentIndex === 0;
      }
      return currentIndex === this.collapsable;
    },
    selectRow(row, index, event) {
      this.onCheckboxClicked(row, index, event);
      if (this.headerRow.children) {
        if (this.allSelected) {
          recursiveSelect(this.headerRow.children, false, this.$set);
        } else {
          recursiveSelect(this.headerRow.children, true, this.$set);
        }
        this.headerRow.vgtSelected = this.allSelected;
      }
    }
  },
  mounted() {},
  components: {}
};
</script>

<style lang="scss"></style>
