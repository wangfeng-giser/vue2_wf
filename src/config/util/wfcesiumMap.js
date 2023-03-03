import Vue from "vue";
import store from "../../store/index";
import router from "../../router/index";
import MSG from "@/config/util/eventBus";
import url from "@public/img/monitorCenter/uav.png";

export default new Vue({
  data() {
    return {
      draw_points_and_cameras: false,
      draw_points: false,
      flag: false,
      plane: null,
      pick_arrow: null,
      pick_arrow_mat4: window.Cesium.Matrix4.fromArray([
        0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 6378137, 0.0, 0.0, 1.0,
      ]),
      start_point: null,
      pick_point: null,
      pick_point_center: new window.Cesium.Cartesian3(),
      labels: new window.Cesium.LabelCollection(),
    };
  },

  methods: {
    initMap(id) {
      window.viewer = new window.Cesium.Viewer(id, {
        animation: false, // 是否显示动画控件
        shouldAnimate: false,
        homeButton: false, // 是否显示Home按钮
        fullscreenButton: false, // 是否显示全屏按钮
        baseLayerPicker: false, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: true, // 是否显示时间线控件
        sceneModePicker: false, // 是否显示投影方式控件
        navigationHelpButton: false, // 是否显示帮助信息控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        scene3DOnly: true, // 每个几何实例将只能以3D渲染以节省GPU内存
        sceneMode: window.Cesium.SceneMode.SCENE3D, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
        fullscreenElement: document.body, // 全屏时渲染的HTML元素 暂时没发现用处
        selectionIndicator: false,

        // requestRenderMode: false,
        // maximumRenderTimeChange: Infinity,
        // maximumRenderTimeChange: 0.001,
        // imageryProvider: new window.Cesium.ArcGisMapServerImageryProvider({
        //   url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
        // }),

        imageryProvider: new window.Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=371a8be29875c5632d5f26ab1d9c1cfe",
          layer: "img",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          credit: new window.Cesium.Credit("天地图全球影像服务"),
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
          maximumLevel: 18,
          tileWidth: 512,
          tileHeight: 512,
        }),

        // terrainProvider: new window.Cesium.EllipsoidTerrainProvider({})
        // imageryProvider: new window.Cesium.UrlTemplateImageryProvider({
        //   url: 'http://192.168.7.131:9999/google2/{z}/{x}/{y}.png', // url为文件夹地址bigemap-mapbox下载
        //   // subdomains: this.subdomains,
        //   tilingScheme: new window.Cesium.WebMercatorTilingScheme(),
        //   // tileWidth: 1024,
        //   // tileHeight: 1024
        // })

        // imageryProvider:new window.Cesium.WebMapTileServiceImageryProvider ({
        //   url:'http://192.168.7.131:6080/arcgis/rest/services/tdtyx/MapServer/WMTS/tile/1.0.0/taixing/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
        //   layer : 'tdtyx',
        //  style : 'default',
        //  format : 'image/png',
        //   tileMatrixSetID : 'default',
        //   // maximumLevel: 6,
        //   tilingScheme: new window.Cesium.GeographicTilingScheme(),
        //   tileWidth: 1024,
        //     tileHeight: 1024
        // })
      });

      if (window.Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        var vtxf_dpr = window.devicePixelRatio;
        // 适度降低分辨率
        while (vtxf_dpr >= 2.0) {
          vtxf_dpr /= 2.0;
        }
        //alert(dpr);
        window.viewer.resolutionScale = vtxf_dpr;
      }

      window.viewer.scene.globe.enableLighting = true;

      window.viewer.scene.light = new window.Cesium.DirectionalLight({
        //去除时间原因影响模型颜色
        direction: new window.Cesium.Cartesian3(
          0.35492591601301104,
          -0.8909182691839401,
          -0.2833588392420772
        ),
      });

      window.viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版本信息
      window.viewer.scene.globe.depthTestAgainstTerrain = true;
      window.viewer.scene.debugShowFramesPerSecond = false; // 显示帧率,帧率与显示流畅度有关，或说与显卡有关
      window.viewer.scene.skyBox.show = false; // 是否显示星空 118.91699306522796 32.02865211505771 7.632826755742545
      // window.viewer.scene.backgroundColor = window.Cesium.Color.BLACK; // 地球背景颜色

      window.viewer.scene.sun.show = false; // 是否显示太阳
      window.viewer.scene.moon.show = false; // 是否显示有月亮
      window.viewer.scene.skyAtmosphere.show = false; // 是否隐藏大气圈
      window.viewer.scene.globe.show = true; // 是否显示地球
      window.viewer.scene.undergroundMode = true; //重要，开启地下模式，设置基色透明，这样就看不见黑色地球了
      // window.viewer.scene.underGlobe.show = true;
      // window.viewer.scene.underGlobe.baseColor = new window.Cesium.Color(
      //   0,
      //   0,
      //   0,
      //   0
      // );
      window.viewer.scene.globe.baseColor = new window.Cesium.Color(0, 0, 0, 0);
      window.viewer.scene.backgroundcolor = new window.Cesium.Color(0, 0, 0, 0);

      window.viewer.timeline.container.style.display = "none";

      if (process.env.NODE_ENV == "development") {
        window.viewer.imageryLayers.removeAll();
      }
      // let position1 = window.Cesium.Cartesian3.fromDegrees(118, 32, 500);
      // let url = "./model/M300Droc.gltf";
      // console.log(url);
      // let entity = window.viewer.entities.add({
      //   id: "1581F5FHD22390010138",
      //   position: position1,
      //   // 模型数据
      //   model: {
      //     uri: url,
      //     scale: 50,
      //   },
      // });
      // window.viewer.zoomTo(entity);

      // console.log(process.env.NODE_ENV);
    },

    //点击获取模型属性，需要先在cesiumlab中把属性和模型进行绑定
    //点击获取地表上的点位位置和高度
    //点击获取模型上的点位位置和高度
    //配合坐标轴
    create_left_click_event2() {
      let _this = this;
      //存储高亮的obj
      let highLight = {
        feature: undefined,
        color: new window.Cesium.Color(),
      };

      var handler = new window.Cesium.ScreenSpaceEventHandler(
        window.viewer.scene.canvas
      );
      handler.setInputAction(function (click) {
        //获取点击的模型
        const pickedObject = window.viewer.scene.pick(click.position);
        // console.log(pickedObject);
        if (window.Cesium.defined(highLight.feature)) {
          // console.log(highLight);
          highLight.feature.appearance.material.uniforms.color =
            highLight.color;
          highLight.feature = undefined;
          highLight.color = new window.Cesium.Color();
          _this.remove_axis();
          _this.pick_point = null;
        }

        if (window.Cesium.defined(pickedObject)) {
          if (pickedObject.id.indexOf("point") != -1) {
            let center = pickedObject.primitive._boundingSphereWC[0].center;
            let center_model = window.Cesium.Cartographic.fromCartesian(center);
            let lngModel1 = window.Cesium.Math.toDegrees(
              center_model.longitude
            );
            let latModel1 = window.Cesium.Math.toDegrees(center_model.latitude);
            let heightModel1 = center_model.height; //模型高度
            _this.load_axis(lngModel1, latModel1, heightModel1);
            _this.pick_point = pickedObject;
            highLight.feature = pickedObject.primitive;
            window.Cesium.Color.clone(
              pickedObject.primitive.appearance.material.uniforms.color,
              highLight.color
            );
            // console.log(highLight);
            pickedObject.primitive.appearance.material.uniforms.color =
              window.Cesium.Color.YELLOW;
          }

          //点击获取模型位置和高度
          let cartesianModel = window.viewer.scene.pickPosition(click.position);
          let cartographicModel =
            window.Cesium.Cartographic.fromCartesian(cartesianModel);
          let lngModel = window.Cesium.Math.toDegrees(
            cartographicModel.longitude
          );
          let latModel = window.Cesium.Math.toDegrees(
            cartographicModel.latitude
          );
          let heightModel = cartographicModel.height; //模型高度
          // console.log(lngModel, latModel, heightModel);
        } else {
          //获取点击地表的位置
          let ray = window.viewer.camera.getPickRay(click.position);
          let cartesian = window.viewer.scene.globe.pick(
            ray,
            window.viewer.scene
          );
          let cartographic =
            window.Cesium.Cartographic.fromCartesian(cartesian);
          let lng = window.Cesium.Math.toDegrees(cartographic.longitude); //经度值
          let lat = window.Cesium.Math.toDegrees(cartographic.latitude); //纬度值
          console.log(lng, lat, cartographic.height);
        }

        //利用cesiumlab给模型添加属性
        // console.log(pickedObject.getPropertyNames());
        // console.log(pickedObject.getProperty('name'));
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    //鼠标移动事件配合坐标轴
    create_move_event2() {
      let highLight = {
        feature: undefined,
        color: new window.Cesium.Color(),
      };
      let _this = this;
      var handler = new window.Cesium.ScreenSpaceEventHandler(
        window.viewer.scene.canvas
      );
      handler.setInputAction(function (event) {
        const pickedObject = window.viewer.scene.pick(event.endPosition);

        if (_this.flag) {
          let endcartesian = window.Cesium.Cartographic.fromCartesian(
            // window.viewer.scene.camera.pickEllipsoid(
            //   event.endPosition,
            //   window.viewer.scene.globe.ellipsoid
            // )
            window.viewer.scene.pickPosition(event.endPosition)
          );

          const surface = window.Cesium.Cartesian3.fromRadians(
            _this.start_point.longitude,
            _this.start_point.latitude,
            _this.start_point.height
          );
          let offset;
          if (_this.pick_arrow.id.indexOf("x") != -1) {
            offset = window.Cesium.Cartesian3.fromRadians(
              endcartesian.longitude,
              _this.start_point.latitude,
              _this.start_point.height
            );
          }

          if (_this.pick_arrow.id.indexOf("y") != -1) {
            offset = window.Cesium.Cartesian3.fromRadians(
              _this.start_point.longitude,
              endcartesian.latitude,
              _this.start_point.height
            );
          }
          if (_this.pick_arrow.id.indexOf("z") != -1) {
            offset = window.Cesium.Cartesian3.fromRadians(
              _this.start_point.longitude,
              _this.start_point.latitude,
              endcartesian.height
            );
          }

          const translation = window.Cesium.Cartesian3.subtract(
            offset,
            surface,
            new window.Cesium.Cartesian3()
          );

          const point = window.Cesium.Cartesian3.add(
            _this.pick_point_center,
            translation,
            new window.Cesium.Cartesian3()
          );
          // console.log(point);

          // let m = translation;

          window.viewer.scene.primitives._primitives.forEach((obj) => {
            if (obj._guid == "axis") {
              obj._primitives.forEach((element) => {
                window.Cesium.Matrix4.multiply(
                  _this.pick_arrow_mat4,
                  window.Cesium.Matrix4.fromTranslation(translation),
                  element.modelMatrix
                );
              });
            } else {
              _this.pick_point.primitive.modelMatrix =
                window.Cesium.Transforms.eastNorthUpToFixedFrame(
                  // window.Cesium.Cartesian3.fromDegrees(
                  //   118.9178303,
                  //   32.029511,
                  //   100
                  // )
                  point
                );
              // window.Cesium.Matrix4.multiplyByTranslation(
              //   point_mat4,
              //   translation,
              //   obj.modelMatrix
              // );
            }
          });
        } else {
          if (window.Cesium.defined(highLight.feature)) {
            highLight.feature.appearance.material.uniforms.color =
              highLight.color;
            highLight.feature = undefined;
            highLight.color = new window.Cesium.Color();
          }
          if (window.Cesium.defined(pickedObject)) {
            // console.log(pickedObject);

            if (
              pickedObject.id &&
              pickedObject.id instanceof window.Cesium.Entity
            ) {
              console.log();
            } else {
              if (pickedObject.id && pickedObject.id.indexOf("arrow") != -1) {
                highLight.feature = pickedObject.primitive;
                window.Cesium.Color.clone(
                  pickedObject.primitive.appearance.material.uniforms.color,
                  highLight.color
                );
                // console.log(highLight.color);
                pickedObject.primitive.appearance.material.uniforms.color =
                  window.Cesium.Color.YELLOW;
              }
            }
          }
        }
      }, window.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //配合坐标轴
    create_left_up_event2() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {
        _this.flag = false;
        viewer.scene.screenSpaceCameraController.enableRotate = true;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    },
    //配合坐标轴
    create_left_down_event2() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {
        //获取点击的模型
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
          if (pickedObject.id.indexOf("arrow") != -1) {
            _this.start_point = Cesium.Cartographic.fromCartesian(
              // viewer.scene.camera.pickEllipsoid(
              //   click.position,
              //   viewer.scene.globe.ellipsoid
              // )
              viewer.scene.pickPosition(click.position)
            );

            // console.log(start_point);
            viewer.scene.screenSpaceCameraController.enableRotate = false;
            _this.pick_arrow = pickedObject;
            _this.flag = true;

            Cesium.Matrix4.clone(
              _this.pick_arrow.primitive.modelMatrix,
              _this.pick_arrow_mat4
            );
            Cesium.Cartesian3.clone(
              _this.pick_point.primitive._boundingSphereWC[0].center,
              _this.pick_point_center
            );
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    },
    //配合坐标轴
    load_axis(longitude, latitude, height) {
      let Cesium = window.Cesium;
      this.remove_axis();
      let arrow_x = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              longitude,
              latitude,
              height,
              longitude + 0.003,
              latitude,
              height,
            ]),
            width: 20.0,
            vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          id: "arrow_x",
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(
            Cesium.Material.PolylineArrowType,
            {
              color: Cesium.Color.GREEN,
            }
          ),
        }),
      });
      let arrow_y = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              longitude,
              latitude,
              height,
              longitude,
              latitude + 0.0025,
              height,
            ]),
            width: 20.0,
            vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          id: "arrow_y",
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(
            Cesium.Material.PolylineArrowType,
            {
              color: Cesium.Color.RED,
            }
          ),
        }),
      });
      let arrow_z = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              longitude,
              latitude,
              height,
              longitude,
              latitude,
              height + 200,
            ]),
            width: 20.0,
            vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          id: "arrow_z",
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(
            Cesium.Material.PolylineArrowType,
            {
              color: Cesium.Color.BLUE,
            }
          ),
        }),
      });

      let axis = new Cesium.PrimitiveCollection();
      axis._guid = "axis";
      axis.add(arrow_x);
      axis.add(arrow_y);
      axis.add(arrow_z);
      window.viewer.scene.primitives.add(axis);
      // console.log(window.viewer.scene.primitives);
    },
    //配合坐标轴
    remove_axis() {
      window.viewer.scene.primitives._primitives.forEach((element) => {
        if (element._guid == "axis") {
          window.viewer.scene.primitives.remove(element);
        }
      });
    },

    //直接拖拽
    create_left_click_event() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {
        //获取点击的模型
        const pickedObject = viewer.scene.pick(click.position);
        // console.log(pickedObject);
        if (Cesium.defined(pickedObject)) {
          //点击获取模型位置和高度
          let cartesianModel = viewer.scene.pickPosition(click.position);
          let cartographicModel =
            Cesium.Cartographic.fromCartesian(cartesianModel);
          let lngModel = Cesium.Math.toDegrees(cartographicModel.longitude);
          let latModel = Cesium.Math.toDegrees(cartographicModel.latitude);
          let heightModel = cartographicModel.height; //模型高度
          // console.log(lngModel, latModel, heightModel);
          if (_this.draw_points_and_cameras) {
            let i = store.state.airline_points.length;

            _this.draw_airline_points(
              "point" + i,
              lngModel,
              latModel,
              heightModel + 5
            );

            if (!_this.draw_points) {
              _this.draw_airline_points(
                "camera" + i,
                lngModel,
                latModel,
                heightModel
              );

              // wfsmallMap.setCameraLocation(
              //   lngModel,
              //   latModel,
              //   heightModel,
              //   0,
              //   -90
              // );

              _this.draw_airline_polylines(
                "polyline" + i,
                lngModel,
                latModel,
                heightModel,
                lngModel,
                latModel,
                heightModel + 5
              );
            }

            if (i > 0) {
              store.state.airline_points.forEach((obj) => {
                if (obj.id == "point" + (i - 1)) {
                  // console.log(obj);
                  _this.draw_airline_polylines(
                    "airline" + i,
                    Cesium.Math.toDegrees(
                      Cesium.Cartographic.fromCartesian(
                        obj.point._boundingSphereWC[0].center
                      ).longitude
                    ),
                    Cesium.Math.toDegrees(
                      Cesium.Cartographic.fromCartesian(
                        obj.point._boundingSphereWC[0].center
                      ).latitude
                    ),

                    Cesium.Cartographic.fromCartesian(
                      obj.point._boundingSphereWC[0].center
                    ).height,
                    lngModel,
                    latModel,
                    heightModel + 5
                  );
                }
              });
            }
            _this.draw_airline_labels(
              i.toString(),
              lngModel,
              latModel,
              heightModel + 6
            );
            _this.draw_points_and_cameras = !_this.draw_points_and_cameras;
          }
        } else {
          //获取点击地表的位置
          let ray = viewer.camera.getPickRay(click.position);
          let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let lng = Cesium.Math.toDegrees(cartographic.longitude); //经度值
          let lat = Cesium.Math.toDegrees(cartographic.latitude); //纬度值
          console.log(cartesian);
        }

        //利用cesiumlab给模型添加属性
        // console.log(pickedObject.getPropertyNames());
        // console.log(pickedObject.getProperty('name'));
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    //直接拖拽
    create_left_down_event() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {
        //获取点击的模型
        const pickedObject = viewer.scene.pick(click.position);
        // console.log(pickedObject);
        if (Cesium.defined(pickedObject)) {
          if (pickedObject.id && pickedObject.id instanceof Cesium.Entity) {
            console.log("");
          } else {
            if (pickedObject.id && pickedObject.id.indexOf("point") != -1) {
              _this.create_plane(
                pickedObject.primitive._boundingSphereWC[0].center
              );
              _this.pick_point = pickedObject;
              _this.flag = true;
              viewer.scene.screenSpaceCameraController.enableRotate = false;
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    },
    //直接拖拽
    create_left_up_event() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {
        if (_this.flag) {
          _this.flag = false;
          viewer.scene.screenSpaceCameraController.enableRotate = true;
          _this.remove_plane();
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    },
    //直接拖拽
    create_move_event() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      let highLight = {
        feature: undefined,
        color: new window.Cesium.Color(),
      };

      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (event) {
        const pickedObject = viewer.scene.pick(event.endPosition);
        if (_this.flag) {
          let endcartesian = viewer.scene.pickPosition(event.endPosition);
          let cartesian = new Cesium.Cartesian3();
          Cesium.Plane.projectPointOntoPlane(
            _this.plane,
            endcartesian,
            cartesian
          );
          let start1 = new Cesium.Cartesian3();
          let i = _this.pick_point.id.substr(5);
          let is_camera = false;
          let polyline = viewer.entities.getById("polyline" + i);
          if (polyline) {
            store.state.airline_cameras.forEach((obj) => {
              if (obj.id == "camera" + i) {
                Cesium.Cartesian3.clone(
                  obj.point._boundingSphereWC[0].center,
                  start1
                );
                is_camera = true;
              }
            });
            polyline.polyline.positions = new Cesium.CallbackProperty(
              function () {
                return [start1, cartesian];
              },
              false
            );
          }

          let airline = viewer.entities.getById("airline" + (parseInt(i) + 1));
          if (airline) {
            let start2 = new Cesium.Cartesian3();
            store.state.airline_points.forEach((obj) => {
              if (obj.id == "point" + (parseInt(i) + 1)) {
                Cesium.Cartesian3.clone(
                  obj.point._boundingSphereWC[0].center,
                  start2
                );
              }
            });
            airline.polyline.positions = new Cesium.CallbackProperty(
              function () {
                return [start2, cartesian];
              },
              false
            );
          }

          if (i != 0) {
            let airline = viewer.entities.getById("airline" + i);
            if (airline) {
              let start2 = new Cesium.Cartesian3();
              store.state.airline_points.forEach((obj) => {
                if (obj.id == "point" + (parseInt(i) - 1)) {
                  Cesium.Cartesian3.clone(
                    obj.point._boundingSphereWC[0].center,
                    start2
                  );
                }
              });
              airline.polyline.positions = new Cesium.CallbackProperty(
                function () {
                  return [start2, cartesian];
                },
                false
              );
            }
          }

          _this.labels._labels.forEach((obj) => {
            if (obj.id == i) {
              // console.log(obj);
              obj.position = new Cesium.Cartesian3(
                endcartesian.x,
                endcartesian.y,
                endcartesian.z + 1
              );
            }
          });

          _this.pick_point.primitive.modelMatrix =
            Cesium.Transforms.eastNorthUpToFixedFrame(cartesian);

          if (is_camera) {
            let transform = Cesium.Transforms.eastNorthUpToFixedFrame(start1);
            let res = new Cesium.Cartesian3();
            let mat4 = new Cesium.Matrix4();
            Cesium.Matrix4.inverse(transform, mat4);
            Cesium.Matrix4.multiplyByPoint(mat4, cartesian, res);
            // let d = Cesium.Cartesian3.distance(
            //   new Cesium.Cartesian3(0.0, 0.0, 0.0),
            //   res
            // );
            // console.log(d);
            // let angle = Cesium.Cartesian3.angleBetween(
            //   new Cesium.Cartesian3(res.x, res.y, 0.0),
            //   res
            // );
            // console.log(Cesium.Math.toDegrees(angle));
            // wfsmallMap.setCameraLocation3(start1, res);
          }
        } else {
          if (window.Cesium.defined(highLight.feature)) {
            highLight.feature.appearance.material.uniforms.color =
              highLight.color;
            highLight.feature = undefined;
            highLight.color = new window.Cesium.Color();
          }
          if (window.Cesium.defined(pickedObject)) {
            if (
              pickedObject.id &&
              pickedObject.id instanceof window.Cesium.Entity
            ) {
              console.log();
            } else {
              if (pickedObject.id && pickedObject.id.indexOf("point") != -1) {
                highLight.feature = pickedObject.primitive;
                window.Cesium.Color.clone(
                  pickedObject.primitive.appearance.material.uniforms.color,
                  highLight.color
                );
                pickedObject.primitive.appearance.material.uniforms.color =
                  window.Cesium.Color.YELLOW;
              }
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //直接拖拽
    create_plane(center) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let normal1 = viewer.camera.position;

      const translation1 = Cesium.Cartesian3.subtract(
        center,
        normal1,
        new window.Cesium.Cartesian3()
      );
      // console.log(normal1, center, translation1);
      Cesium.Cartesian3.normalize(translation1, translation1);

      // console.log(translation1);
      this.plane = Cesium.Plane.fromPointNormal(center, translation1);
      // console.log(this.plane);
      let entity = viewer.entities.add({
        id: "plane",
        position: center,
        orientation: Cesium.Quaternion.fromHeadingPitchRoll(
          Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0)
        ),
        plane: {
          plane: new Cesium.Plane(this.plane.normal, 0),

          dimensions: new Cesium.Cartesian2(1000.0, 1000.0),
          // material: Cesium.Color.RED.withAlpha(0.01),
          material: new Cesium.Color(1, 0, 0, 0.1),
          // fill: false,
        },
      });
    },
    //直接拖拽
    remove_plane() {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let _this = this;
      let entity = viewer.entities.getById("plane");
      viewer.entities.remove(entity);
    },

    //加载点位
    draw_airline_points(id, longitude, latitude, height) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let point = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.EllipsoidGeometry({
            radii: new Cesium.Cartesian3(1, 1, 1),
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          }),
          modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
          ),
          id: id,
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          material: Cesium.Material.fromType(Cesium.Material.ColorType, {
            color:
              id.indexOf("point") != -1
                ? Cesium.Color.PURPLE
                : Cesium.Color.GREEN,
          }),
        }),
      });

      window.viewer.scene.primitives.add(point);

      if (id.indexOf("point") != -1) {
        store.state.airline_points.push({
          id: id,
          point: point,
        });
      }
      if (id.indexOf("camera") != -1) {
        store.state.airline_cameras.push({
          id: id,
          point: point,
        });
      }
    },
    //加载序号
    draw_airline_labels(id, longitude, latitude, height) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      this.labels.add({
        id: id,
        position: new Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        ),
        text: id,
        scale: 0.5,
        fillColor: Cesium.Color.RED,
        // eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 10),
      });
      viewer.scene.primitives.add(this.labels);
    },
    //加载连线
    draw_airline_polylines(
      id,
      start_longitude,
      start_latitude,
      start_height,
      end_longitude,
      end_latitude,
      end_height
    ) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let polyline = viewer.entities.add({
        id: id,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            start_longitude,
            start_latitude,
            start_height,
            end_longitude,
            end_latitude,
            end_height,
          ]),
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashLength: 8.0,
          }),
        },
      });
    },

    start_draw_points_and_cameras() {
      this.draw_points_and_cameras = true;
      this.draw_points = false;
    },

    start_draw_points() {
      this.draw_points_and_cameras = true;
      this.draw_points = true;
    },

    //设置相机位置
    setCameraLocation(
      camermLongitude,
      cameraLatitude,
      cameraHeight,
      heading,
      pitch
    ) {
      window.viewer.camera.setView({
        destination: window.Cesium.Cartesian3.fromDegrees(
          camermLongitude,
          cameraLatitude,
          cameraHeight
        ),
        orientation: {
          heading: window.Cesium.Math.toRadians(heading), //
          pitch: window.Cesium.Math.toRadians(pitch), // 正数相机朝向天空
          // roll: Cesium.Math.toRadians(0)
        },
        // complete: function callback() {
        //   setTimeout(function () { }, 100);
        // },
      });
    },

    setCameraLocation2(
      centerLongitude,
      centerLatitude,
      centerHeight,
      cameraHeading,
      cameraPitch,
      range
    ) {
      let Cesium = window.Cesium;
      let center = Cesium.Cartesian3.fromDegrees(
        centerLongitude,
        centerLatitude,
        centerHeight
      );
      let heading = Cesium.Math.toRadians(cameraHeading);
      let pitch = Cesium.Math.toRadians(cameraPitch);
      window.viewer.camera.lookAt(
        center,
        new Cesium.HeadingPitchRange(heading, pitch, range)
      );
      window.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    },

    //加载时间轴
    set_timeline() {
      let startTime = window.Cesium.JulianDate.fromDate(new Date());
      startTime = window.Cesium.JulianDate.addHours(
        startTime,
        8,
        new window.Cesium.JulianDate()
      );
      let stop = window.Cesium.JulianDate.addHours(
        startTime,
        12,
        new window.Cesium.JulianDate()
      ); // 设置结束时间为开始时间加400秒
      // 设置时钟开始时间
      window.viewer.clock.startTime = startTime.clone();
      // 设置时钟当前时间
      window.viewer.clock.currentTime = startTime.clone();
      // 设置时钟结束时间
      window.viewer.clock.stopTime = stop.clone();
      // 时间速率，数字越大时间过的越快，设置1好像是和实际时间一样
      window.viewer.clock.multiplier = 1;
      // 时间轴绑定到viewer上去
      window.viewer.timeline.zoomTo(startTime, stop);
      window.viewer.clock.clockRange = window.Cesium.ClockRange.LOOP_STOP;
      window.positionProperty = new window.Cesium.SampledPositionProperty();
      window.viewer.clock.shouldAnimate = true;
    },

    //加载罗盘等控件
    set_navigation() {
      const options = {};

      // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      options.enableCompass = true;
      // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
      options.enableZoomControls = true;
      // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      options.enableDistanceLegend = true;
      // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      options.enableCompassOuterRing = true;

      //修改重置视图的tooltip
      options.resetTooltip = "重置视图";
      //修改放大按钮的tooltip
      options.zoomInTooltip = "放大";
      //修改缩小按钮的tooltip
      options.zoomOutTooltip = "缩小";

      //如需自定义罗盘控件，请看下面的自定义罗盘控件
      new window.CesiumNavigation(window.viewer, options);
    },

    load3dTilesModel(
      id,
      url,
      longitude,
      latitude,
      height,
      rotateX,
      rotateY,
      rotateZ,
      scaleX,
      scaleY,
      scaleZ
    ) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let photography = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: url,
          backFaceCulling: true,
          maximumScreenSpaceError: 16, //最大的屏幕空间误差
          maximumMemoryUsage: 512,
          cullWithChildrenBounds: false,
          dynamicScreenSpaceErrorDensity: 0.00278,
          dynamicScreenSpaceErrorFactor: 4,
          dynamicScreenSpaceErrorHeightFalloff: 0.25,
          skipLevelOfDetail: true,
          baseScreenSpaceError: 1024,
          skipScreenSpaceErrorFactor: 16,
          skipLevels: 1,
          preferLeaves: false,
          // maximumNumberOfLoadedTiles: 10000, //最大加载瓦片个数
        })
      );

      photography.readyPromise.then(function (argument) {
        let position = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        ); //目标位置
        const modelMat4 = Cesium.Transforms.eastNorthUpToFixedFrame(position);

        //绕X轴旋转，x轴指向南方，上北向南
        let rotationX = Cesium.Matrix4.fromRotationTranslation(
          window.Cesium.Matrix3.fromRotationX(
            window.Cesium.Math.toRadians(rotateX)
          )
        );

        //绕Y轴旋转，y轴指向冬，左西右东
        let rotationY = Cesium.Matrix4.fromRotationTranslation(
          window.Cesium.Matrix3.fromRotationY(
            window.Cesium.Math.toRadians(rotateY)
          )
        );

        //绕Z轴旋转，z轴指向天空
        let rotationZ = Cesium.Matrix4.fromRotationTranslation(
          window.Cesium.Matrix3.fromRotationZ(
            window.Cesium.Math.toRadians(rotateZ)
          )
        );

        Cesium.Matrix4.multiply(modelMat4, rotationX, modelMat4);
        Cesium.Matrix4.multiply(modelMat4, rotationY, modelMat4);
        Cesium.Matrix4.multiply(modelMat4, rotationZ, modelMat4);

        //缩放矩阵
        let scaleM = Cesium.Matrix4.fromScale(
          new window.Cesium.Cartesian3(scaleX, scaleY, scaleZ)
        );

        Cesium.Matrix4.multiply(modelMat4, scaleM, modelMat4);

        photography._root.transform = modelMat4;
        photography._properties = {
          id: id,
        };
      });
      viewer.zoomTo(photography);
    },

    load3dTilesModel2(url) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      // viewer.scene.primitives.removeAll();
      let bool_model = false;
      viewer.scene.primitives._primitives.forEach((obj) => {
        if (obj._url == url) {
          // console.log(obj._url);
          // console.log(url);
          bool_model = true;
        }
      });

      if (bool_model) {
        return;
      }

      viewer.scene.primitives.removeAll();
      var tilesetModel = new Cesium.Cesium3DTileset({
        url: url,
        backFaceCulling: true,
        maximumScreenSpaceError: 16, //最大的屏幕空间误差
        maximumMemoryUsage: 512,
        cullWithChildrenBounds: false,
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4,
        dynamicScreenSpaceErrorHeightFalloff: 0.25,
        skipLevelOfDetail: true,
        baseScreenSpaceError: 1024,
        skipScreenSpaceErrorFactor: 16,
        skipLevels: 1,
        preferLeaves: false,
      });

      viewer.scene.primitives.add(tilesetModel);
      viewer.zoomTo(tilesetModel);
    },

    loadGltfModel(
      id,
      url,
      longitude,
      latitude,
      height,
      scale,
      rotateX,
      rotateY,
      rotateZ
    ) {
      let origin = window.Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      let modelMatrix =
        window.Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      //绕X轴旋转，x轴指向南方，上北向南
      let rotationX = window.Cesium.Matrix4.fromRotationTranslation(
        window.Cesium.Matrix3.fromRotationX(
          window.Cesium.Math.toRadians(rotateX)
        )
      );

      //绕Y轴旋转，y轴指向冬，左西右东
      let rotationY = window.Cesium.Matrix4.fromRotationTranslation(
        window.Cesium.Matrix3.fromRotationY(
          window.Cesium.Math.toRadians(rotateY)
        )
      );

      //绕Z轴旋转，z轴指向天空
      let rotationZ = window.Cesium.Matrix4.fromRotationTranslation(
        window.Cesium.Matrix3.fromRotationZ(
          window.Cesium.Math.toRadians(rotateZ)
        )
      );

      window.Cesium.Matrix4.multiply(modelMatrix, rotationX, modelMatrix);
      window.Cesium.Matrix4.multiply(modelMatrix, rotationY, modelMatrix);
      window.Cesium.Matrix4.multiply(modelMatrix, rotationZ, modelMatrix);
      let model = window.viewer.scene.primitives.add(
        window.Cesium.Model.fromGltf({
          url: url,
          show: true,
          modelMatrix: modelMatrix,
          scale: scale,
          id: id,
          minimumPixelSize: 127,
        })
      );

      model.readyPromise.then(function (model) {
        // Play all animations when the model is ready to render
        model.activeAnimations.addAll();
      });
    },

    destoryMap() {
      window.viewer.entities.removeAll();
      let gl = window.viewer.scene.context._originalGLContext;
      console.log("销毁");
      gl.getExtension("WEBGL_lose_context").loseContext();
      window.viewer.destroy();
    },

    draw_airport(data) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      viewer.entities.removeAll();

      data.forEach((obj) => {
        let circle = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            obj.longitude,
            obj.latitude,
            obj.altitude
          ),

          ellipse: {
            semiMinorAxis: obj.area * 1000,
            semiMajorAxis: obj.area * 1000,
            height: 30,
            fill: false,
            outlineWidth: 20,
            outlineColor: Cesium.Color.YELLOW,
            outline: true, // height must be set for outline to display
          },
        });
        let point = viewer.entities.add({
          id: obj.id,
          name: "airport",
          position: Cesium.Cartesian3.fromDegrees(
            obj.longitude,
            obj.latitude,
            obj.altitude
          ),
          billboard: {
            // image: require("../../../public/img/monitorCenter/uav.png"),
            image: url,
            pixelOffset: new Cesium.Cartesian2(0, -30),
            with: 60,
            height: 60,
          },
          // properties: obj,
        });
      });
      viewer.zoomTo(viewer.entities);
    },

    create_left_click_event3() {
      let _this = this;
      //存储高亮的obj
      let highLight = {
        feature: undefined,
        color: new window.Cesium.Color(),
      };

      var handler = new window.Cesium.ScreenSpaceEventHandler(
        window.viewer.scene.canvas
      );
      handler.setInputAction(function (click) {
        //获取点击的模型
        const pickedObject = window.viewer.scene.pick(click.position);
        // console.log(pickedObject);
        // if (window.Cesium.defined(highLight.feature)) {
        //   // console.log(highLight);
        //   highLight.feature.appearance.material.uniforms.color =
        //     highLight.color;
        //   highLight.feature = undefined;
        //   highLight.color = new window.Cesium.Color();
        // }
        // console.log(router);

        if (window.Cesium.defined(pickedObject)) {
          console.log(pickedObject);
          //点击获取模型位置和高度
          // let cartesianModel = window.viewer.scene.pickPosition(click.position);
          // let cartographicModel =
          //   window.Cesium.Cartographic.fromCartesian(cartesianModel);
          // let lngModel = window.Cesium.Math.toDegrees(
          //   cartographicModel.longitude
          // );
          // let latModel = window.Cesium.Math.toDegrees(
          //   cartographicModel.latitude
          // );
          // let heightModel = cartographicModel.height; //模型高度
          // console.log(lngModel, latModel, heightModel);
          if (pickedObject.id.name == "airport") {
            if (router.currentRoute.name == "dashboard") {
              router.push({
                name: "monitor",
                params: { id: pickedObject.id.id },
              });
            }
            if (router.currentRoute.name == "monitor") {
              _this.zoomTo_entity(pickedObject.id.id);
              MSG.$emit("airport_id", pickedObject.id.id);
              // setTimeout(() => {
              // _this.popup_position(pickedObject.id);
              // _this.popup_text(pickedObject.id);
              // }, 2000);
            }
          }
        } else {
          //获取点击地表的位置
          // let ray = window.viewer.camera.getPickRay(click.position);
          // let cartesian = window.viewer.scene.globe.pick(
          //   ray,
          //   window.viewer.scene
          // );
          // let cartographic =
          //   window.Cesium.Cartographic.fromCartesian(cartesian);
          // let lng = window.Cesium.Math.toDegrees(cartographic.longitude); //经度值
          // let lat = window.Cesium.Math.toDegrees(cartographic.latitude); //纬度值
          // console.log(lng, lat, cartographic.height);
        }
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    popup_position(entity) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let gisPosition = entity.position._value;
      // console.log(document.getElementById("pop").style);
      document.getElementById("pop").style.display = "inline-block";
      if (window.handler) {
        window.handler.call();
      }
      window.handler = viewer.scene.postRender.addEventListener(() => {
        //转化为屏幕坐标
        let windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          viewer.scene,
          gisPosition
        );
        // console.log(gisPosition);
        document.getElementById("pop").style.left =
          windowPosition.x - 20 + "px";
        document.getElementById("pop").style.top =
          windowPosition.y - 260 + "px";
      });
    },

    popup_text(entity) {
      // console.log(entity);
      document.getElementById("pop_title_text").innerHTML =
        entity.properties.name._value;
      document.getElementById("airport_name").innerHTML =
        entity.properties.model_name._value;
      document.getElementById("longtitude").innerHTML =
        entity.properties.longitude._value;
      document.getElementById("latitude").innerHTML =
        entity.properties.latitude._value;
      document.getElementById("height").innerHTML =
        entity.properties.altitude._value;
    },

    zoomTo_entity(id) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let entity = viewer.entities.getById(id);
      viewer.zoomTo(entity);
    },

    draw_drone_line(data) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      let points = [];
      data.forEach((obj, index) => {
        points.push(obj.longitude, obj.latitude, obj.altitude);
      });
      let polyline = viewer.entities.add({
        id: "polyline1",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(points),
          width: 5,
          material: Cesium.Color.RED,
        },
      });

      // console.log(points);
      viewer.zoomTo(polyline);
    },

    renew_position(
      bool_model,
      device_sn,
      num,
      type,
      longitude,
      latitude,
      height,
      heading,
      pitch,
      roll
    ) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;

      if (!bool_model) {
        //不存在模型
        let time1 = viewer.clock.currentTime;
        let position1 = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        );
        window.positionProperty.addSample(time1, position1);
        // let url = this.createUavUrl(type);
        let uav = viewer.entities.add({
          id: device_sn,
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: time1,
              stop: viewer.clock.stopTime,
            }),
          ]),
          position: position1,
          // 模型数据
          model: {
            uri: "./model/M300Droc.gltf",
            scale: 50,
          },
          orientation: Cesium.Transforms.headingPitchRollQuaternion(
            position1,
            new Cesium.HeadingPitchRoll(
              Cesium.Math.toRadians(heading),
              Cesium.Math.toRadians(pitch),
              Cesium.Math.toRadians(roll)
            ),
            Cesium.Ellipsoid.WGS84,
            Cesium.Transforms.northWestUpToFixedFrame
          ),
        });

        viewer.zoomTo(uav);
        viewer.trackedEntity = uav;
      } else {
        //有模型
        let position2 = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        );

        let uav = viewer.entities.getById(device_sn);
        //判断设置的秒数和当前的时间差，如不满足就加2等待，满足就直接赋予时间
        if (
          num -
            Cesium.JulianDate.secondsDifference(
              viewer.clock.currentTime,
              uav.availability.start
            ) <
          2
        ) {
          // console.log(uav.position);
          store.state.num_time = num + 2;
          // console.log(num);
          if (uav.position.getValue(viewer.clock.currentTime) != undefined) {
            uav.position = uav.position.getValue(viewer.clock.currentTime);
          } else {
            uav.position = uav.position.getValue(
              Cesium.JulianDate.addSeconds(
                viewer.clock.currentTime,
                -1,
                new Cesium.JulianDate()
              )
            );
          }
        } else {
          let time2 = Cesium.JulianDate.addSeconds(
            uav.availability.start,
            num,
            new Cesium.JulianDate()
          );
          window.positionProperty.addSample(time2, position2);
          uav.position = window.positionProperty;
          uav.orientation = Cesium.Transforms.headingPitchRollQuaternion(
            position2,
            new Cesium.HeadingPitchRoll(
              Cesium.Math.toRadians(heading),
              Cesium.Math.toRadians(pitch),
              Cesium.Math.toRadians(roll)
            ),
            Cesium.Ellipsoid.WGS84,
            Cesium.Transforms.northWestUpToFixedFrame
          );
          store.state.num_time++;
          // console.log(num);
        }
      }
    },

    renew_position2(
      bool_model,
      device_sn,
      num,
      type,
      longitude,
      latitude,
      height,
      heading,
      pitch,
      roll
    ) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;

      //不存在模型
      let time1 = viewer.clock.currentTime;
      let position1 = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      // window.positionProperty.addSample(time1, position1);
      // let url = this.createUavUrl(type);
      let uav = viewer.entities.getById(device_sn);
      // console.log(uav);
      if (uav) {
        uav.position = position1;
        // viewer.zoomTo(uav);
        // viewer.trackedEntity = uav;
        viewer.zoomTo(uav);
      } else {
        let position1 = Cesium.Cartesian3.fromDegrees(118, 32, 500);
        let url = "./model/M300Droc.gltf";
        // console.log(url);
        let entity = viewer.entities.add({
          id: "1581F5FHD22390010138",
          position: position1,
          // 模型数据
          model: {
            uri: url,
            scale: 50,
          },
        });
        viewer.zoomTo(entity);
      }
    },

    createUavUrl(type) {},

    renew_polyline(bool_drone_polyline, longitude, latitude, height) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      if (!bool_drone_polyline) {
        let polyline = viewer.entities.add({
          id: "polyline2",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              longitude,
              latitude,
              height,
              longitude,
              latitude,
              height,
            ]),
            width: 4,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.CYAN,
            }),
          },
        });
        console.log(polyline);
      } else {
        let polyline = viewer.entities.getById("polyline2");

        // polyline.position._value
        let arry = polyline.polyline.positions._value;
        arry.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, height));
        polyline.polyline.positions = arry;
      }
    },

    remove_entity(id) {
      // let Cesium = window.Cesium;
      let viewer = window.viewer;
      let entity = viewer.entities.getById(id);
      viewer.entities.remove(entity);
    },

    draw_route(data) {
      let Cesium = window.Cesium;
      let viewer = window.viewer;
      viewer.entities.removeAll();
      let points = [];
      if (data.length > 1) {
        data.forEach((obj, index) => {
          points.push(obj.longitude, obj.latitude, obj.altitude);
          viewer.entities.add({
            id: index,
            position: Cesium.Cartesian3.fromDegrees(
              obj.longitude,
              obj.latitude,
              obj.altitude
            ),
            ellipsoid: {
              radii: new Cesium.Cartesian3(0.5, 0.5, 0.5),
              material: Cesium.Color.RED,
              outline: false,
            },
          });
        });
        let polyline = viewer.entities.add({
          id: "polyline1",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(points),
            width: 2,
            material: Cesium.Color.GREEN,
          },
        });
        viewer.zoomTo(polyline);
      }
    },

    // //利用czml数据进行漫游功能
    // flyByRoute() {
    //   //设置czml数据,也就是飞行路线
    //   const czml = [
    //     {
    //       id: "document",
    //       name: "CZML Path",
    //       version: "1.0",
    //       //interval表示时间间隔，multiplier表示倍数，interval/multiplier表示漫游整个路径所花费的时间
    //       clock: {
    //         interval: "2012-08-04T10:00:00Z/2012-08-04T10:03:00Z",
    //         currentTime: "2012-08-04T10:00:00Z",
    //         multiplier: 10,
    //       },
    //     },
    //     {
    //       id: "path",
    //       name: "path with GPS flight data",
    //       //调整width用来查看路径
    //       path: {
    //         width: 0,
    //         leadTime: 10,
    //         trailTime: 1000,
    //         resolution: 5,
    //       },
    //       ////有billboard，摄像机会自动跟踪,，也可以改成gltf模型，gltf模型可以自动转向
    //       // billboard: {
    //       //   image:
    //       //     "data:image/png;base64,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",
    //       //   scale: 1.5,
    //       //   eyeOffset: {
    //       //     cartesian: [0.0, 0.0, -10.0],
    //       //   },
    //       // },
    //       ////调整最前面的序号，可以调整速度
    //       position: {
    //         epoch: "2012-08-04T10:00:00Z",
    //         cartographicDegrees: [
    //           0, 119.5898590198399, 34.20083509750373, 2,
    //           // 10, 119.59132353100297, 34.201365646969755, 200,
    //           // 20, 119.59096937282567, 34.20142321589442, 200,
    //           // 30, 119.59038472158652, 34.201515359291754, 200,
    //           // 40, 119.59004770737315, 34.201587930017624, 200,
    //           // 50, 119.58967034141182, 34.20167624092619, 200,
    //           // 60, 119.58931533569702, 34.20171487841153, 200,
    //           // 70, 119.58890508808888, 34.20188250493821, 200,
    //           // 80, 119.58849237218631, 34.20154638433805, 200,
    //           // 90, 119.58839189139245, 34.201397394100326, 200,
    //           60, 119.58985897845962, 34.20080666017414, 2,
    //           // 110, 119.5879720031023, 34.200747274515294, 200,
    //           // 120, 119.58784943682619, 34.200413279636415, 200,
    //           // 130, 119.58731288619258, 34.20064621149691, 200,
    //           // 140, 119.587166633305, 34.20055164223595, 200,
    //           // 150, 119.58656548656458, 34.20053690013212, 200,
    //           // 160, 119.58633945383815, 34.20005316658084, 200,
    //           // 170, 119.58615276931002, 34.19990012212523, 200,
    //           180, 119.58995148114279, 34.200806882886084, 2,
    //         ],
    //       },
    //     },
    //   ];

    //   var flyEntity;

    //   //飞行漫游
    //   window.viewer.dataSources
    //     .add(window.Cesium.CzmlDataSource.load(czml))
    //     .then(function (ds) {
    //       flyEntity = ds.entities.getById("path");

    //       //为了使线段平缓，所以进行的插值
    //       // flyEntity.position.setInterpolationOptions({
    //       //   interpolationDegree: 5,
    //       //   interpolationAlgorithm: window.Cesium.LagrangePolynomialApproximation
    //       // })

    //       window.viewer.trackedEntity = flyEntity;
    //     });

    //   //设定目标点，使得相机到位置之后进行方向的变换
    //   const target = new window.Cesium.Cartesian3.fromDegrees(
    //     119.58985897845962,
    //     34.20080666017414,
    //     2
    //   );
    //   var i = 0;
    //   // console.log(target);
    //   function setRoamView() {
    //     if (flyEntity) {
    //       const center = flyEntity.position.getValue(
    //         window.viewer.clock.currentTime
    //       );
    //       // console.log(flyEntity.orientation);
    //       if (center) {
    //         // const vector = new window.Cesium.Cartesian3(target.x - center.x, target.y - center.y, 200)
    //         // window.viewer.camera.lookAt(center, vector)

    //         var heading;
    //         var pitch;
    //         var range = 0.1;
    //         console.log(Math.abs(center.x - target.x));
    //         if (
    //           Math.abs(center.x - target.x) > 0 &&
    //           Math.abs(center.x - target.x) < 0.06
    //         ) {
    //           i = 1;

    //           // console.log(Math.abs(center.x - target.x));
    //         }

    //         if (i != 0) {
    //           // alert('ok')
    //           heading = window.Cesium.Math.toRadians(90);
    //           pitch = window.Cesium.Math.toRadians(0);
    //           window.viewer.clock.shouldAnimate = false;
    //           setTimeout(() => {
    //             window.viewer.clock.shouldAnimate = true;
    //           }, 5000);
    //         } else {
    //           heading = window.Cesium.Math.toRadians(180);
    //           pitch = window.Cesium.Math.toRadians(0);
    //         }

    //         window.viewer.camera.lookAt(
    //           center,
    //           new window.Cesium.HeadingPitchRange(heading, pitch, range)
    //         );
    //       }
    //     }
    //   }
    //   //表示相机运动，更新相机位置
    //   window.viewer.scene.preUpdate.addEventListener(setRoamView);

    //   //暂停
    //   // setTimeout(() => {

    //   //   window.viewer.clock.shouldAnimate = false
    //   // }, 5000)

    //   // //开始
    //   // setTimeout(() => {

    //   //   window.viewer.clock.shouldAnimate = true
    //   // }, 10000)

    //   //重置漫游将clock的时间重置为时间线的一开始
    // },

    // //绕中心点旋转
    // flyByCenter(options) {
    //   let Cesium = window.Cesium;
    //   let viewer = window.viewer;
    //   var position = Cesium.Cartesian3.fromDegrees(
    //     options.lng,
    //     options.lat,
    //     0.0
    //   );
    //   // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
    //   var pitch = Cesium.Math.toRadians(options.pitch);
    //   // 给定飞行一周所需时间，比如30s, 那么每秒转动度数
    //   var angle = 360 / 30;
    //   // 给定相机距离点多少距离飞行
    //   var distance = options.height;
    //   var startTime = Cesium.JulianDate.fromDate(new Date());

    //   var stopTime = Cesium.JulianDate.addSeconds(
    //     startTime,
    //     30,
    //     new Cesium.JulianDate()
    //   );

    //   viewer.clock.startTime = startTime.clone(); // 开始时间
    //   viewer.clock.stopTime = stopTime.clone(); // 结速时间
    //   viewer.clock.currentTime = startTime.clone(); // 当前时间
    //   viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
    //   viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
    //   // 相机的当前heading
    //   var initialHeading = viewer.camera.heading;
    //   console.log(initialHeading);
    //   var Exection = function TimeExecution() {
    //     // 当前已经过去的时间，单位s
    //     var delTime = Cesium.JulianDate.secondsDifference(
    //       viewer.clock.currentTime,
    //       viewer.clock.startTime
    //     );
    //     // 根据过去的时间，计算偏航角的变化
    //     var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;

    //     viewer.camera.lookAt(
    //       position,
    //       new Cesium.HeadingPitchRange(heading, pitch, distance)
    //     );

    //     if (
    //       Cesium.JulianDate.compare(
    //         viewer.clock.currentTime,
    //         viewer.clock.stopTime
    //       ) >= 0
    //     ) {
    //       viewer.clock.onTick.removeEventListener(Exection);
    //     }
    //   };
    //   viewer.clock.onTick.addEventListener(Exection);
    // },

    // //官网示例漫游功能
    // flyByColock() {
    //   let jsonData = [
    //     {
    //       longitude: 119.5898590198399,
    //       latitude: 34.20083509750373,
    //       height: 1,
    //     },
    //     {
    //       longitude: 119.58985897845962,
    //       latitude: 34.20080666017414,
    //       height: 1,
    //     },
    //     {
    //       longitude: 119.58995148114279,
    //       latitude: 34.200806882886084,
    //       height: 1,
    //     },
    //   ];

    //   let Cesium = window.Cesium;
    //   let viewer = window.viewer;

    //   //通过调整时间来调整运行速率
    //   const timeStepInSeconds = 30;
    //   const totalSeconds = timeStepInSeconds * (jsonData.length - 1);

    //   let startTime = Cesium.JulianDate.fromDate(new Date());
    //   let stopTime = Cesium.JulianDate.addSeconds(
    //     startTime,
    //     totalSeconds,
    //     new Cesium.JulianDate()
    //   );
    //   viewer.clock.startTime = startTime.clone(); // 开始时间
    //   viewer.clock.stopTime = stopTime.clone(); // 结束时间
    //   viewer.clock.currentTime = startTime.clone(); // 当前时间
    //   //LOOP_STOP控制漫游循环，CLAMPED不循环
    //   viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

    //   // viewer.clock.shouldAnimate = true;
    //   //将时间轴缩放至设定的那一段
    //   // viewer.timeline.zoomTo(startTime, stopTime);

    //   viewer.clock.multiplier = 1;
    //   // Start playing the scene.
    //   viewer.clock.shouldAnimate = true;
    //   const positionProperty = new Cesium.SampledPositionProperty();

    //   for (let i = 0; i < jsonData.length; i++) {
    //     const dataPoint = jsonData[i];

    //     // Declare the time for this individual sample and store it in a new JulianDate instance.
    //     const time = Cesium.JulianDate.addSeconds(
    //       startTime,
    //       i * timeStepInSeconds,
    //       new Cesium.JulianDate()
    //     );
    //     const position = Cesium.Cartesian3.fromDegrees(
    //       dataPoint.longitude,
    //       dataPoint.latitude,
    //       dataPoint.height
    //     );
    //     // Store the position along with its timestamp.
    //     // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
    //     positionProperty.addSample(time, position);

    //     viewer.entities.add({
    //       position: position,
    //       point: { pixelSize: 10, color: Cesium.Color.RED },
    //     });
    //   }

    //   const airplaneEntity = viewer.entities.add({
    //     availability: new Cesium.TimeIntervalCollection([
    //       new Cesium.TimeInterval({ start: startTime, stop: stopTime }),
    //     ]),
    //     position: positionProperty,
    //     // point: { pixelSize: 30, color: Cesium.Color.GREEN },
    //     // path: new Cesium.PathGraphics({ width: 3 })
    //     orientation: new Cesium.VelocityOrientationProperty(positionProperty),

    //     model: {
    //       uri: "Cesium/obj/convert/jqr.gltf",
    //       scale: 0.1,
    //     },
    //   });
    //   // Make the camera track this moving entity.
    //   // viewer.trackedEntity = airplaneEntity;

    //   // //调整相机跟随位置
    //   // function setRoamView() {
    //   //   if (airplaneEntity) {
    //   //     const center = airplaneEntity.position.getValue(window.viewer.clock.currentTime)
    //   //     console.log(center);
    //   //     if (center) {
    //   //       // const vector = new window.Cesium.Cartesian3(target.x - center.x, target.y - center.y, 200)
    //   //       // window.viewer.camera.lookAt(center, vector)

    //   //       var heading
    //   //       var pitch
    //   //       var range = 10

    //   //       heading = window.Cesium.Math.toRadians(180);
    //   //       pitch = window.Cesium.Math.toRadians(-40);

    //   //       window.viewer.camera.lookAt(center, new window.Cesium.HeadingPitchRange(heading, pitch, range))

    //   //     }
    //   //   }
    //   // }
    //   // //表示相机运动，更新相机位置
    //   // window.viewer.scene.preUpdate.addEventListener(setRoamView)

    //   //渲染监听
    //   // viewer.scene.postRender.addEventListener(function () {

    //   //   let position = airplaneEntity.getValue(viewer.clock.currentTime);
    //   //   console.log(position);

    //   // })
    // },

    // //websocket更新位置
    // renewPosition(
    //   isModel,
    //   id,
    //   num,
    //   type,
    //   longitude,
    //   latitude,
    //   height,
    //   heading,
    //   pitch,
    //   roll
    // ) {
    //   let Cesium = window.Cesium;
    //   //判断是否存在模型，如果不存在就要创建
    //   if (!isModel) {
    //     var time1 = window.viewer.clock.currentTime;
    //     // console.log(time1, window.viewer.clock.stopTime);

    //     var position1 = Cesium.Cartesian3.fromDegrees(
    //       longitude,
    //       latitude,
    //       height
    //     );

    //     // let url = this.createUavUrl(type)
    //     let url = "";
    //     window.positionProperty.addSample(time1, position1);
    //     let uav = window.viewer.entities.add({
    //       id: id,
    //       availability: new Cesium.TimeIntervalCollection([
    //         new Cesium.TimeInterval({
    //           start: time1,
    //           stop: window.viewer.clock.stopTime,
    //         }),
    //       ]),

    //       position: position1,
    //       // position: positionProperty,
    //       // 模型数据
    //       model: {
    //         uri: url,
    //         scale: 50,
    //       },
    //       orientation: Cesium.Transforms.headingPitchRollQuaternion(
    //         position1,
    //         new Cesium.HeadingPitchRoll(
    //           Cesium.Math.toRadians(heading),
    //           Cesium.Math.toRadians(pitch),
    //           Cesium.Math.toRadians(roll)
    //         ),
    //         Cesium.Ellipsoid.WGS84,
    //         Cesium.Transforms.northWestUpToFixedFrame
    //       ),
    //     });
    //     window.viewer.zoomTo(uav);
    //     window.viewer.trackedEntity = uav;
    //   } else {
    //     //有了模型之后设置位置，
    //     let position2 = Cesium.Cartesian3.fromDegrees(
    //       longitude,
    //       latitude,
    //       height
    //     );

    //     let uav = window.viewer.entities.getById(id);

    //     //判断设置的秒数和当前的时间差，如不满足就加2等待，满足就直接赋予时间
    //     if (
    //       num -
    //         Cesium.JulianDate.secondsDifference(
    //           window.viewer.clock.currentTime,
    //           uav.availability.start
    //         ) <
    //       2
    //     ) {
    //       if (
    //         uav.position.getValue(window.viewer.clock.currentTime) != undefined
    //       ) {
    //         uav.position = uav.position.getValue(
    //           window.viewer.clock.currentTime
    //         );
    //       } else {
    //         uav.position = uav.position.getValue(
    //           Cesium.JulianDate.addSeconds(
    //             window.viewer.clock.currentTime,
    //             -1,
    //             new Cesium.JulianDate()
    //           )
    //         );
    //       }

    //       num = num + 2;
    //     } else {
    //       let time2 = Cesium.JulianDate.addSeconds(
    //         uav.availability.start,
    //         num,
    //         new Cesium.JulianDate()
    //       );
    //       window.positionProperty.addSample(time2, position2);
    //       uav.position = window.positionProperty;
    //       uav.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    //         position2,
    //         new Cesium.HeadingPitchRoll(
    //           Cesium.Math.toRadians(heading),
    //           Cesium.Math.toRadians(pitch),
    //           Cesium.Math.toRadians(roll)
    //         ),
    //         Cesium.Ellipsoid.WGS84,
    //         Cesium.Transforms.northWestUpToFixedFrame
    //       );
    //       num++;
    //     }
    //   }
    // },
  },
});
