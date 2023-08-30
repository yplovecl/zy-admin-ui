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
      <el-amap-layer-labels>
        <template v-for="item in equipmentList">
          <el-amap-label-marker v-if="item.siteLocLat && item.siteLocLon" :key="item.equipmentIdentity" :icon="icon"
                                :position="[item.siteLocLon, item.siteLocLat]" @click="showWin(item)"/>
        </template>
      </el-amap-layer-labels>
      <el-amap-info-window v-if="visible" :position="center" :offset="[0, -45]" :isCustom="true"
                           closeWhenClickMap>
        <div class="info-window">
          <div>设备编号：{{ deviceDetail.equipmentIdentity }}</div>
          <div class="name" v-hasRole="['admin', 'manager']">所属企业：{{ deviceDetail.enterpriseName || '--' }}</div>
          <div class="status">在线状态：
            <span v-if="deviceDetail.online === 'Y'" class="tag online">在线</span>
            <span v-else class="tag">离线</span>
          </div>
          <div class="name">设备地址：{{ deviceDetail.siteLoc }}</div>
        </div>
      </el-amap-info-window>
    </el-amap>
  </div>
</template>

<script setup name="EquipmentMap">
import {listEquipment} from "@/api/seismograph/equipment";
import {Screenshot} from '@amap/screenshot'
import markerImg from '@/assets/images/poi-marker.png'

const mapRef = ref();
const zoom = ref(12);
const icon = ref({
  image: markerImg,
  anchor: 'bottom-center',
  size: [25, 34],
  clipOrigin: [280, 8],
  clipSize: [50, 68]
});
const visible = ref(false);

const equipmentList = ref([]);
const loading = ref(true);
const total = ref(0);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 100000,
    enterpriseId: null,
    params: {
      map: '1'
    }
  },
  deviceDetail: {},
  center: []
});

const savePNG = () => {
  // console.log('setup $refs: ', mapRef.value.$$getInstance())
  const screenshot = new Screenshot(mapRef.value.$$getInstance())
  screenshot.download({filename: "地图.png"});
}

const {queryParams, form, rules, deviceDetail, center} = toRefs(data);

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listEquipment(queryParams.value).then(response => {
    equipmentList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

const markerText = (content) => {
  return {
    content: content,
    direction: 'right',
    style: {
      fontSize: 14,
      fillColor: '#fff',
      // strokeColor: 'rgba(255,0,0,0.5)',
      // strokeWidth: 2,
      // padding: [3, 10],
      backgroundColor: '#409eff',
      borderColor: '#dcdfe6',
      borderWidth: 1,
    }
  }
}

const showWin = (data) => {
  center.value = [data.siteLocLon, data.siteLocLat]
  deviceDetail.value = data
  visible.value = true
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

.info-window {
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  font-size: 14px;
  color: #606266;
  line-height: 24px;

  > div {
    &.name{
      white-space: nowrap;
    }
    &.status{
      display: flex;
      flex-direction: row;
      align-items: center;
      .tag{
        display: flex;
        padding: 0 5px;
        font-size: 12px;
        color: #fff;
        background-color: #f56c6c;
        border-radius: 5px;
        &.online{
          background-color: #409eff;
        }
      }
    }
  }

  &:after {
    top: 100%;
    left: 50%;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border: 10px solid rgba(136, 183, 213, 0);
    border-top-color: #fff;
    margin-left: -10px;
  }
}
</style>
