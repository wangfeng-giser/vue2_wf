import Vue from "vue";
import store from "../../store/index";
import router from "../../router/index";
import MSG from "@/config/util/eventBus";
import AILabel from "ailabel";
import utils from "@/config/util/util";

export default new Vue({
  data() {
    return {
      gMap: null, //AILabel实例
      gFeatureLayer: null, //矢量图层实例(矩形，多边形等矢量)
      gImageLayer: null,
      gTextLayer: null,
      gMarker: null,
    };
  },
  methods: {
    init_gMap(id, width, height, url) {
      this.gMap = new AILabel.Map(id, {
        center: { x: width / 2, y: height / 2 },
        size: {
          width: width, // 图片宽度
          height: height, // 图片高度
        },
        zoom: width,
        mode: "PAN",
        zoomWhenDrawing: true,
      });
      this.init_gImageLayer(url, width, height);
      this.init_gFeatureLayer();
      this.init_gTextLayer();
      this.init_event();
    },

    init_gImageLayer(url, width, height) {
      this.gImageLayer = new AILabel.Layer.Image(
        "first-layer-image", // id
        {
          src: url,
          width: width, // 图片宽度
          height: height, // 图片高度
          position: {
            // 图片左上角对应的坐标位置
            x: 0,
            y: 0,
          },
        }, // imageInfo

        { name: "图片图层" }, // props
        { zIndex: 5 } // style
      );
      this.gMap.addLayer(this.gImageLayer);
    },

    init_gFeatureLayer() {
      this.gFeatureLayer = new AILabel.Layer.Feature(
        "first-layer-feature", // id
        { name: "第一个矢量图层" }, // props
        { zIndex: 10 } // style
      );
      this.gMap.addLayer(this.gFeatureLayer);
    },

    init_gTextLayer() {
      this.gTextLayer = new AILabel.Layer.Text(
        "first-layer-text", // id
        { name: "第一个文本图层" }, // props
        { zIndex: 12, opacity: 1 } // style
      );
      this.gMap.addLayer(this.gTextLayer);
    },

    init_event() {
      this.gMap.events.on("drawDone", (mode, data) => {
        // console.log(data);
        let id = utils.guid();
        const gFeatureRect = new AILabel.Feature.Rect(
          id, // id
          data, // shape
          { name: "第一个矢量图层" }, // props
          { strokeStyle: "#FFF", lineWidth: 3 } // style
        );
        this.gFeatureLayer.addFeature(gFeatureRect);

        const gText = new AILabel.Text(
          id, // id
          {
            text: "请输入文本",
            position: { x: data.x, y: data.y },
            offset: { x: 0, y: 0 },
          }, // shape
          { name: "第一个文本对象" }, // props
          {
            // fill: false,
            fillStyle: "#c1c0bb",
            strokeStyle: "#c1c0bb",
            // background: true,
            // globalAlpha: 0,

            fontColor: "#000",
          } // style
        );
        this.gTextLayer.addText(gText);
        // setTimeout(() => {
        this.gMap.setActiveFeature(gFeatureRect);
        // }, 2000);

        MSG.$emit("set_text", id);
      });

      this.gMap.events.on("featureUpdated", (feature, shape) => {
        // console.log(feature);
        // console.log(shape);
        feature.updateShape(shape);

        let gText = this.gTextLayer.getTextById(feature.id);
        gText.updatePosition({ x: shape.x, y: shape.y });

        MSG.$emit("set_text", feature.id);
      });
      this.gMap.events.on("click", (point) => {
        // console.log(this.gMap.mode);
        if (this.gMap.mode == "RECT") {
          const targetFeature = this.gMap.getTargetFeatureWithPoint(
            point.global
          );
          this.gMap.markerLayer.removeAllMarkers();
          if (targetFeature) {
            this.gMap.setActiveFeature(targetFeature);
            // console.log(targetFeature);
            this.gMarker = new AILabel.Marker(
              targetFeature.id, // id
              {
                src: "/img/share/close.png",
                position: {
                  // marker坐标位置
                  x: targetFeature.shape.x + targetFeature.shape.width,
                  y: targetFeature.shape.y,
                },
                offset: {
                  x: -18,
                  y: -3,
                },
              }, // markerInfo
              { name: "第一个marker注记" } // props
            );
            this.gMap.markerLayer.addMarker(this.gMarker);
            this.gMarker.events.on("click", (EMarkerEventType) => {
              this.gFeatureLayer.removeFeatureById(EMarkerEventType.id);
              this.gTextLayer.removeTextById(EMarkerEventType.id);
              this.gMap.markerLayer.removeMarkerById(EMarkerEventType.id);
            });
            MSG.$emit("set_text", targetFeature.id);
          } else {
            this.gMap.setActiveFeature(null);
          }
        }
      });
    },

    set_mode(mode) {
      this.gMap.setMode(mode);
    },

    set_text(id, text) {
      console.log(id);
      let gText = this.gTextLayer.getTextById(id);
      gText.updateText(text);
    },

    set_image_layer(url, width, height) {
      this.gMap.removeLayerById("first-layer-image");
      this.init_gImageLayer(url, width, height);
    },

    draw_label(data) {
      const gFeatureRect = new AILabel.Feature.Rect(
        data.uuid, // id
        data.shape, // shape
        { name: "第一个矢量图层" }, // props
        { strokeStyle: "#F00", lineWidth: 3 } // style
      );
      this.gFeatureLayer.addFeature(gFeatureRect);
    },

    draw_text(data) {
      const gText = new AILabel.Text(
        data.uuid, // id
        {
          text: data.text,
          position: { x: data.shape.x, y: data.shape.y },
          offset: { x: 0, y: 0 },
        }, // shape
        { name: "第一个文本对象" }, // props
        {
          fillStyle: "#c1c0bb",
          strokeStyle: "#c1c0bb",
          fontColor: "#000",
        } // style
      );
      this.gTextLayer.addText(gText);
    },

    clear_label() {
      this.gMap.markerLayer.removeAllMarkers();
      this.gFeatureLayer.removeAllFeatures();
      this.gTextLayer.removeAllTexts();
    },
  },
});
