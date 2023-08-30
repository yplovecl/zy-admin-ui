<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <span>
                <template v-if="userStore.enterprise?.enterpriseId">
                <el-button v-if="device.isSeconded == 'N'" type="success" class="button" @click="handleReturn()"
                           v-hasPermi="['seismograph:equipment:seconded']">归还</el-button>
                <el-button v-if="device.enterpriseId && !device.isSeconded" type="primary" class="button"
                           @click="handleSeconded()"
                           v-hasPermi="['seismograph:equipment:seconded']">借调</el-button>
                </template>
                <el-button type="default" class="button" @click="router.back()">返回</el-button>
              </span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">设备编号</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.equipmentIdentity || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">所属企业</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.enterpriseId ? device.enterpriseName : '' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">是否在线</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">
                    <el-tag v-if="device.online == 'Y'" type="success" size="default">在线</el-tag>
                    <el-tag v-else type="danger" size="default">离线</el-tag>
                  </div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">站点号</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.siteNo || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">第一次使用时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.firstUseTime || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">站点名</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.siteName || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">累计使用时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.accumulativeUseTime || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">站点地址</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.siteLoc || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">最后修改时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.updateTime || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">备注</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.remark || '-' }}</div>
                </td>
              </tr>
              <tr v-if="device.isSeconded">
                <td class="el-table__cell is-leaf">
                  <div class="cell">归还状态</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">
                    <el-tag v-if="device.isSeconded == 'Y'" type="success" size="default">已归还</el-tag>
                    <el-tag v-else type="danger" size="default">待归还</el-tag>
                  </div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">最迟归还时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ device.returnTime || '-' }}</div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-dialog title="借调设备" v-model="open" width="500px" append-to-body>
        <el-form ref="secondedRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="设备编号" prop="equipmentIdentity">
            <el-input v-model="form.equipmentIdentity" disabled placeholder="请输入设备设备编号"/>
          </el-form-item>
          <el-form-item label="借调企业" prop="toEnterpriseId">
            <el-select v-model="form.toEnterpriseId" placeholder="请选择企业" style="width: 100%">
              <el-option v-for="item in enterpriseList" :key="item.enterpriseId" :label="item.name"
                         :value="item.enterpriseId" :disabled="item.enterpriseId == form.fromEnterpriseId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="归还时间" prop="returnTime">
            <el-date-picker clearable
                            v-model="form.returnTime"
                            type="date"
                            value-format="YYYY-MM-DD"
                            placeholder="请选择归还时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注"/>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="open=false">取 消</el-button>
          </div>
        </template>
      </el-dialog>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>设备数据</span>
              <el-button type="primary" class="button" size="small" @click="syncDeviceData" :loading="loading">
                数据同步
              </el-button>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">电压</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.voltage || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">电流</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.current }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">方位角</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.azimuth || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">温度</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.tem || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">采样率</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.samplingRate || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">采集持续时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.duration }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">采集开始时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.startTime || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">气压</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.pres }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">高程</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.devalt }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">存储容量</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.capacity || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">剩余容量</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.residual || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">俯仰角</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.pitchingAngle || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">翻滚角</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ payload.rollingAngle || '-' }}</div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <span>实时波形</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="chartRef" style="height: 523px"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="DeviceDetail">
import {getCurrentInstance, reactive, ref, toRefs} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getEquipment, returnEquipment, secondedEquipment, syncEquipmentData} from "@/api/seismograph/equipment";
import useUserStore from "@/store/modules/user";
import {listEnterprise} from "@/api/seismograph/enterprise";
import * as echarts from "echarts";

const userStore = useUserStore()
const route = useRoute();
const router = useRouter();
const {id} = route.query
if (!parseInt(id)) {
  window.location.href = '/'
}

const open = ref(false);
const {proxy} = getCurrentInstance();
const chartRef = ref(null);

const data = reactive({
  enterpriseList: [],
  device: {},
  payload: {},
  form: {},
  rules: {
    equipmentIdentity: [
      {required: true, message: "设备id不能为空", trigger: "blur"}
    ],
    toEnterpriseId: [
      {required: true, message: "请选择一个企业", trigger: "blur"}
    ],
    returnTime: [
      {required: true, message: "归还时间不能为空", trigger: "blur"}
    ]
  }
});

const {device, form, rules, enterpriseList, payload} = toRefs(data);

function getList() {
  proxy.$modal.loading("正在加载设备数据，请稍候！");
  getEquipment(id).then(response => {
    proxy.$modal.closeLoading();
    device.value = response.data;
    payload.value = response.data?.payload || {};
  })
}

function loadEnterprise() {
  if (enterpriseList.value.length > 0) return
  listEnterprise({pageNum: 1, pageSize: 500}).then(response => {
    enterpriseList.value = response.rows || [];
  });
}

// 表单重置
function reset() {
  loadEnterprise()
  form.value = {
    equipmentIdentity: device.value.equipmentIdentity,
    fromEnterpriseId: device.value.enterpriseId,
    toEnterpriseId: null,
    remark: null,
    returnTime: null
  };
  proxy.resetForm("secondedRef");
}

function handleSeconded() {
  reset();
  open.value = true;
}

function submitForm() {
  proxy.$refs["secondedRef"].validate(valid => {
    if (!valid) return;
    secondedEquipment(form.value).then(response => {
      proxy.$modal.msgSuccess("借调成功");
      open.value = false;
      router.back()
    });
  });
}


function handleReturn() {
  proxy.$modal.confirm('是否确认归还编号为"' + device.value.equipmentIdentity + '"的设备？').then(function () {
    return returnEquipment({equipmentIdentity: device.value.equipmentIdentity});
  }).then(() => {
    proxy.$modal.msgSuccess("归还成功");
    router.back()
  }).catch(() => {
    getList();
  });
}

const loading = ref(false)
const syncDeviceData = () => {
  loading.value = true;
  syncEquipmentData(id).then(response => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess("已成功发送指令，等待设备上报数据");
    } else {
      proxy.$modal.msgError(response.msg || "网络异常，请稍后再试");
    }
    // getList()
  }).finally(() => loading.value = false)
}
const loadChartData = () => {
  chartInstance.value.hideLoading();
  chartInstance.value.setOption({
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  })
}
const chartInstance = ref();
onMounted(() => {
  chartInstance.value = echarts.init(chartRef.value);
  chartInstance.value.showLoading();
  loadChartData()
})
getList();
</script>
<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
