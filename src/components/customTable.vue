<!--  -->
<template>
  <div class="customTable">
    <el-table
      width="100%"
      height="100%"
      :data="tableData"
      border
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      @row-click="handle_row_click"
      :cell-style="{}"
      :header-cell-style="{}"
    >
      <template v-for="(item, index) in colums">
        <slot v-if="item.slot" :name="item.slot"> </slot>
        <el-table-column
          v-else
          :key="index"
          :type="item.type ? item.type : ''"
          :sortable="item.sortable ? item.sortable : false"
          :prop="item.prop"
          :label="item.label"
          :width="item.width ? item.width : ''"
          :min-width="item.min_width ? item.min_width : ''"
          :align="item.align ? item.align : ''"
          :class-name="item.class_name ? item.class_name : ''"
        >
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name: "customTable",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    colums: {
      type: Array,
    },
  },
  data() {
    //这里存放数据
    return {
      multipleSelection: [],
      json_row: {},
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 0) {
        return "dark";
      } else {
        return "light";
      }
    },
    handleSelectionChange(val) {
      // console.log(val);
      this.multipleSelection = val;
      this.$emit("handleSelectionChange", this.multipleSelection);
    },

    handle_row_click(row, column, event) {
      this.json_row = row;
      this.$emit("handle_row_click", this.json_row);
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less">
//@import url(); 引入公共css类
@import "@/assets/css/customTable.less";
</style>
