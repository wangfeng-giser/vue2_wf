<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
  components: {},
  mounted() {
    const wh = window.innerHeight / 937;
    const ww = window.innerWidth / 1920;
    document.body.style =
      "transform:scale(" + ww + " ," + wh + ");transform-origin:left top;";
    window.addEventListener("resize", () => {
      const wh = window.innerHeight / 937;
      const ww = window.innerWidth / 1920;
      document.body.style =
        "transform:scale(" + ww + " ," + wh + ");transform-origin:left top;";
    });
  },
};
</script>
<style lang="less">
html {
  overflow: hidden;
}

body {
  padding: 0;
  margin: 0;
  width: 1920px;
  height: 937px;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
