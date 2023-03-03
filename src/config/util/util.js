import Vue from "vue";

export default new Vue({
  data() {
    return {
      arry_player: [],
    };
  },
  methods: {
    judge_undefined(data, type) {
      if (data == "") {
        return undefined;
      } else {
        switch (type) {
          case "float":
            return parseFloat(data);

          default:
            return data;
        }
      }
    },

    //生成随机数
    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid() {
      return (
        this.S4() +
        this.S4() +
        "-" +
        this.S4() +
        "-" +
        this.S4() +
        "-" +
        this.S4() +
        "-" +
        this.S4() +
        this.S4() +
        this.S4()
      );
    },
  },
});
