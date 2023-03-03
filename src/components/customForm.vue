<!--  -->
<template>
  <div class="custom_form">
    <el-form ref="form" :model="json_form" label-width="auto">
      <el-form-item
        v-for="(item, index) in array_form"
        :key="index"
        :label="item.label + '：'"
        :prop="item.prop"
      >
        <el-input
          v-model="json_form_copy[item.prop]"
          v-if="item.control == 'input'"
          size="mini"
        ></el-input>
        <el-select
          v-model="json_form_copy[item.prop]"
          v-if="item.control == 'select'"
          clearable
          :popper-append-to-body="false"
          size="mini"
        >
          <el-option
            v-for="item in item.array_option"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name: "customForm",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    array_form: {
      type: Array,
    },
    json_form: {
      type: Object,
    },
  },
  data() {
    //这里存放数据
    return {
      json_form_copy: this.json_form,
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {},
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
@import "@/assets/css/customForm.less";
</style>
