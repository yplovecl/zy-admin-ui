<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button type="success" class="button" @click="router.back()">返回</el-button>
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
                  <div class="cell">{{ data.equipmentIdentity || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">所属企业</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.enterpriseId ? data.enterpriseName : '' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">在线</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">
                    <el-tag v-if="data.online == 'Y'" type="success" size="default">在线</el-tag>
                    <el-tag v-else type="danger" size="default">离线</el-tag>
                  </div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">站点号</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.siteNo || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">第一次使用时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.firstUseTime || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">站点名</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.siteName || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">累计使用时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.accumulativeUseTime || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">站点地址</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.siteLoc || '-' }}</div>
                </td>
              </tr>
              <tr>
                <td class="el-table__cell is-leaf">
                  <div class="cell">最后修改时间</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.updateTime || '-' }}</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">备注</div>
                </td>
                <td class="el-table__cell is-leaf">
                  <div class="cell">{{ data.remark || '-' }}</div>
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
            <span style="vertical-align: middle;">设备数据</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px"/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <span style="vertical-align: middle;">巡检记录</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="DeviceDetail">
import {getCurrentInstance, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getEquipment} from "@/api/seismograph/equipment";

const route = useRoute();
const router = useRouter();
const {id} = route.query
if (!parseInt(id)) {
  window.location.href = '/'
}

const data = ref({});
const {proxy} = getCurrentInstance();

function getList() {
  proxy.$modal.loading("正在加载设备数据，请稍候！");
  getEquipment(id).then(response => {
    proxy.$modal.closeLoading();
    data.value = response.data;
  })
}

getList();
</script>
<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
