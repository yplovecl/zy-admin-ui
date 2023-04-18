<template>
  <div class="app-container">
    <el-row :gutter="10" class="opt-nav">
      <el-col :span="1.5">
        <el-button type="primary" icon="Download" v-hasPermi="['seismograph:equipment:map:export']" @click="savePNG">
          导出
        </el-button>
      </el-col>
    </el-row>
    <el-amap ref="mapRef" :zoom="zoom" :WebGLParams="{ preserveDrawingBuffer: true }">
      <!--      <template v-for="item in equipmentList">
              <el-amap-marker v-if="item.siteLocLat && item.siteLocLon" :key="item.enterpriseId" :position="[item.siteLocLon, item.siteLocLat]"/>
            </template>-->
      <el-amap-layer-labels>
        <template v-for="item in equipmentList">
          <el-amap-label-marker v-if="item.siteLocLat && item.siteLocLon" :key="item.enterpriseId"
                                :icon="icon"
                                :position="[item.siteLocLon, item.siteLocLat]"/>
        </template>
      </el-amap-layer-labels>
    </el-amap>
  </div>
</template>

<script setup name="EquipmentMap">
import {listEquipment} from "@/api/seismograph/equipment";
import {Screenshot} from '@amap/screenshot'

const mapRef = ref();
// const center = ref([121.59996, 31.197646]);
const zoom = ref(12);
const icon = ref({
  image: 'https://a.amap.com/jsapi_demos/static/images/poi-marker.png',
  anchor: 'bottom-center',
  size: [25, 34],
  clipOrigin: [280, 8],
  clipSize: [50, 68]
});

const equipmentList = ref([]);
const loading = ref(true);
const total = ref(0);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 100000,
    enterpriseId: null,
  }
});

const init = () => {
  console.log('setup $refs: ', mapRef.value.$$getInstance())
}

const savePNG = () => {
  // console.log('setup $refs: ', mapRef.value.$$getInstance())
  const screenshot = new Screenshot(mapRef.value.$$getInstance())
  screenshot.download({filename: "地图.png"});
}

const {queryParams, form, rules} = toRefs(data);

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listEquipment(queryParams.value).then(response => {
    equipmentList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

getList();
</script>
<style lang="scss" scoped>
.app-container {
  padding: 0;
  height: calc(100vh - 50px);
  position: relative;

  .opt-nav {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
  }
}
</style>
