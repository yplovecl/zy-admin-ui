<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编号" prop="equipmentIdentity">
        <el-input
            v-model="queryParams.equipmentIdentity"
            placeholder="请输入设备编号"
            :maxlength="30"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="!(userStore.enterprise?.enterpriseId > 0)" label="所属企业" prop="enterpriseId">
        <el-select v-model="queryParams.enterpriseId" placeholder="请选择企业" clearable>
          <el-option v-for="item in enterpriseList" :key="item.enterpriseId" :label="item.name"
                     :value="item.enterpriseId"/>
        </el-select>
      </el-form-item>
      <el-form-item label="站点号" v-if="false" prop="siteNo">
        <el-input
            v-model="queryParams.siteNo"
            placeholder="请输入站点号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名" v-if="false" prop="siteName">
        <el-input
            v-model="queryParams.siteName"
            placeholder="请输入站点名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="布设人" v-if="false" prop="deployer">
        <el-input
            v-model="queryParams.deployer"
            placeholder="请输入布设人"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点地址" v-if="false" prop="siteLoc">
        <el-input
            v-model="queryParams.siteLoc"
            placeholder="请输入站点地址"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工作模式" prop="workMode">
        <el-select v-model="queryParams.workMode" placeholder="波形上传模式" clearable>
          <el-option
              v-for="dict in device_work_mode"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否在线" prop="online">
        <el-select v-model="queryParams.online" placeholder="设备是否在线" clearable>
          <el-option
              v-for="dict in sys_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="5G模块" prop="have5g">
        <el-select v-model="queryParams.have5g" placeholder="是否带有5G" clearable>
          <el-option
              v-for="dict in sys_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['seismograph:equipment:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['seismograph:equipment:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['seismograph:equipment:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['seismograph:equipment:export']"
        >导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleBatchAdd"
            v-hasPermi="['seismograph:equipment:add']"
        >批量添加
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="equipmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--      <el-table-column label="ID" align="center" prop="equipmentId" max-width="100"/>-->
      <el-table-column label="设备编号" align="center" prop="equipmentIdentity" width="180"/>
      <el-table-column v-if="!userStore.enterprise.enterpriseId" label="所属企业" align="center" prop="enterpriseName"
                       :show-overflow-tooltip="true">
        <template #default="scope">
          {{ scope.row.enterpriseName || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="在线" align="center" prop="online" width="80">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.online"/>
        </template>
      </el-table-column>
      <el-table-column label="5G模块" align="center" prop="have5g" width="80">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.have5g"/>
        </template>
      </el-table-column>
      <el-table-column label="封包间隔" align="center" prop="packetTime" width="100">
        <template #default="scope">
          {{ scope.row.packetTime }}分钟
        </template>
      </el-table-column>
      <el-table-column label="第一次使用" align="center" prop="firstUseTime" width="150">
      </el-table-column>
      <el-table-column label="工作模式" align="center" prop="workMode" width="100">
        <template #default="scope">
          <dict-tag :options="device_work_mode" :value="scope.row.workMode"/>
        </template>
      </el-table-column>
      <!--      <el-table-column label="使用时长" align="center" prop="accumulativeUseTime" width="100"/>-->
      <!--      <el-table-column label="站点号" align="center" prop="siteNo"/>-->
      <!--      <el-table-column label="站点名" align="center" prop="siteName"/>-->
      <!--      <el-table-column label="布设人" align="center" prop="deployer"/>-->
      <!--      <el-table-column label="经度" align="center" prop="siteLocLon" min-width="120" :show-overflow-tooltip="true"/>-->
      <!--      <el-table-column label="纬度" align="center" prop="siteLocLat" min-width="120" :show-overflow-tooltip="true"/>-->
      <el-table-column label="站点地址" align="center" prop="siteLoc" min-width="300" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-link v-if="scope.row.siteLocLon && scope.row.siteLocLat"
                   :href="`https://uri.amap.com/marker?position=${scope.row.siteLocLon},${scope.row.siteLocLat}`"
                   target="_blank">{{ scope.row.siteLoc || '--' }}
          </el-link>
          <span v-else>{{ scope.row.siteLoc || '--' }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="站点图片" align="center" prop="siteImageUri" width="100">
              <template #default="scope">
                <image-preview :src="scope.row.siteImageUri" :width="50" :height="50"/>
              </template>
            </el-table-column>-->
      <!--      <el-table-column label="站点视频" align="center" prop="siteVideoUri">
              <template #default="scope">
                <span>{{ scope.row.siteVideoUri }}</span>
              </template>
            </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Setting" @click="handleConfig(scope.row)"
                     v-hasPermi="['seismograph:equipment:wrConfig']">配置
          </el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['seismograph:equipment:edit']">修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['seismograph:equipment:remove']">删除
          </el-button>
          <router-link :to="{path: 'detail', query: {id: scope.row.equipmentId}}"
                       v-hasPermi="['seismograph:equipment:detail']">
            <el-button link type="primary" icon="Delete">详情</el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改设备对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="equipmentRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="equipmentIdentity">
              <el-input v-model="form.equipmentIdentity" maxlength="30" placeholder="请输入设备编号"
                        :show-word-limit="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="带有5G" prop="have5g">
              <el-select v-model="form.have5g" placeholder="是否带有5G" style="width: 100%">
                <el-option key="Y" label="是" value="Y"/>
                <el-option key="N" label="否" value="N"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属企业" prop="enterpriseId">
              <el-select v-model="form.enterpriseId" placeholder="请选择企业" style="width: 100%">
                <el-option
                    v-for="item in enterpriseList"
                    :key="item.enterpriseId"
                    :label="item.name"
                    :value="item.enterpriseId"
                    :disabled="item.status === '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="封包间隔" prop="packetTime">
              <el-select v-model="form.packetTime" placeholder="请选择封包间隔时间" style="width: 100%">
                <el-option v-for="val in 30" :key="val" :label="`${val}分钟`" :value="val"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="第一次使用" prop="firstUseTime">
              <el-date-picker :editable="false"
                              v-model="form.firstUseTime"
                              type="date"
                              value-format="YYYY-MM-DD"
                              placeholder="请选择第一次使用">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作模式" prop="workMode">
              <el-select v-model="form.workMode" placeholder="请选择波形上传模式" style="width: 100%">
                <el-option
                    v-for="dict in device_work_mode"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="使用时长" prop="accumulativeUseTime">
              <el-input v-model="form.accumulativeUseTime" readonly placeholder="使用时长"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点号" prop="siteNo">
              <el-input v-model="form.siteNo" placeholder="请输入站点号" maxlength="12"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="布设人" prop="deployer">
              <el-input v-model="form.deployer" placeholder="请输入布设人" maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点名" prop="siteName">
              <el-input v-model="form.siteName" placeholder="请输入站点名" maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="站点地址" prop="siteLoc">
              <el-input v-model="form.siteLoc" placeholder="请输入站点地址" maxlength="100"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" maxlength="50"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经度" prop="siteLocLon">
              <el-input v-model="form.siteLocLon" placeholder="请输入经度"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="siteLocLat">
              <el-input v-model="form.siteLocLat" placeholder="请输入纬度"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="false">
          <el-col :span="12">
            <el-form-item label="站点图片" prop="siteImageUri">
              <image-upload v-model="form.siteImageUri"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点视频" prop="siteVideoUri">
              <file-upload v-model="form.siteVideoUri"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量添加 -->
    <el-dialog title="批量添加设备" v-model="open1" width="500px" append-to-body>
      <el-form ref="batchAddRef" :model="batchAddForm" :rules="rules" label-width="120px">
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="batchAddForm.enterpriseId" placeholder="请选择企业" style="width: 100%">
            <el-option
                v-for="item in enterpriseList"
                :key="item.enterpriseId"
                :label="item.name"
                :value="item.enterpriseId"
                :disabled="item.status === '1'"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="带有5G" prop="have5g">
          <el-select v-model="batchAddForm.have5g" placeholder="是否带有5G" style="width: 100%">
            <el-option key="Y" label="是" value="Y"/>
            <el-option key="N" label="否" value="N"/>
          </el-select>
        </el-form-item>
        <el-form-item label="封包间隔" prop="packetTime">
          <el-select v-model="batchAddForm.packetTime" placeholder="请选择封包间隔时间" style="width: 100%">
            <el-option v-for="val in 30" :key="val" :label="`${val}分钟`" :value="val"/>
          </el-select>
        </el-form-item>
        <el-form-item label="工作模式" prop="workMode">
          <el-select v-model="batchAddForm.workMode" placeholder="请选择波形上传模式" style="width: 100%">
            <el-option
                v-for="dict in device_work_mode"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号模板" prop="idTpl">
          <el-select v-model="batchAddForm.idTpl" placeholder="请选择设备编号模板" style="width: 100%">
            <el-option
                v-for="dict in device_id_tpl"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="编号范围" prop="start">
              <el-input-number v-model.number="batchAddForm.start" min="0" max="999998" placeholder="起始" controls-position="right"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="end">
              <el-input-number v-model.number="batchAddForm.end" min="1" max="999999" placeholder="结束" controls-position="right"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitBatchForm">确 定</el-button>
          <el-button @click="open1=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- WR平台⻚⾯配置对话框 -->
    <el-dialog title="WR300平台配置" v-model="showConfig" class="wr-config" width="560px" append-to-body>
      <el-tabs type="border-card" v-model="tabName" class="config-tabs">
        <el-tab-pane label="设备状态" name="status">
          <el-descriptions title="概要" :column="1">
            <el-descriptions-item label="设备型号">{{ deviceStatus.stats?.model || '-' }}</el-descriptions-item>
            <el-descriptions-item label="序列号">{{ deviceStatus.stats?.serial_number || '-' }}</el-descriptions-item>
            <el-descriptions-item label="固件版本">{{ deviceStatus.stats?.firmware_version || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions title="蜂窝⽹" :column="1">
            <el-descriptions-item label="⼯作模式">SIM{{ deviceStatus.Cellular?.link_mode }}</el-descriptions-item>
            <el-descriptions-item label="信号强度">{{ deviceStatus.Cellular?.siglevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="运营商">{{ deviceStatus.Cellular?.operator || '-' }}</el-descriptions-item>
            <el-descriptions-item label="ICCID">{{ deviceStatus.Cellular?.iccid || '-' }}</el-descriptions-item>
            <el-descriptions-item label="拨号⽅式">{{ deviceStatus.Cellular?.modem || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="WIFI配置" name="wifi">
          <el-form ref="wifiConfigRef" :model="wifiForm" :rules="wrRules" label-width="100px" label-position="left">
            <el-form-item label="天线" prop="ant">
              <el-radio-group v-model="wifiForm.ant">
                <el-radio-button :label="0">内置</el-radio-button>
                <el-radio-button :label="1">外置</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="模式" prop="mode">
              <el-radio-group v-model="wifiForm.wifi.mode">
                <el-radio-button :label="1">STA</el-radio-button>
                <el-radio-button :label="2">AP</el-radio-button>
                <el-radio-button :label="3">AP+STA</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <template v-if="wifiForm.wifi.mode === 2">
              <el-form-item label="SSID" prop="wifi.ap.ssid">
                <el-input v-model="wifiForm.wifi.ap.ssid" placeholder="SSID" maxlength="64" show-word-limit :disabled="!editable"/>
              </el-form-item>
              <el-form-item label="密码" prop="wifi.ap.key">
                <el-input v-model="wifiForm.wifi.ap.key" placeholder="密码" maxlength="64" show-word-limit :disabled="!editable"/>
              </el-form-item>
              <el-form-item label="加密方式" prop="wifi.ap.auth">
                <el-select v-model="wifiForm.wifi.ap.auth" placeholder="请选择加密方式" style="width: 100%">
                  <el-option label="OPEN" value="OPEN"/>
                  <el-option label="WPAPSK" value="WPAPSK"/>
                  <el-option label="WPA2PSK" value="WPA2PSK"/>
                  <el-option label="WPAWPA2PSK" value="WPAWPA2PSK"/>
                </el-select>
              </el-form-item>
            </template>
            <template v-else-if="wifiForm.wifi.mode === 1">
              <el-form-item label="SSID" prop="wifi.sta.ssid">
                <el-input v-model="wifiForm.wifi.sta.ssid" placeholder="SSID" maxlength="64" show-word-limit/>
              </el-form-item>
              <el-form-item label="密码" prop="wifi.sta.key">
                <el-input v-model="wifiForm.wifi.sta.key" placeholder="密码" maxlength="64" show-word-limit :disabled="!editable"/>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item label="节点地址" prop="wifi.center.address">
                <el-input v-model="wifiForm.wifi.center.address" placeholder="节点地址" maxlength="20" show-word-limit :disabled="!editable"/>
              </el-form-item>
              <el-form-item label="节点端口" prop="wifi.center.port">
                <el-input type="number" v-model="wifiForm.wifi.center.port" placeholder="节点端口" :disabled="!editable"/>
              </el-form-item>
              <el-form-item label="节点协议" prop="wifi.center.protocol">
                <el-radio-group v-model="wifiForm.wifi.center.protocol" :disabled="!editable">
                  <el-radio label="TCP">TCP</el-radio>
                  <el-radio label="UDP">UDP</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="心跳时间" prop="wifi.center.keepalive">
                <el-input type="number" v-model="wifiForm.wifi.center.keepalive" placeholder="心跳时间" :disabled="!editable"/>
              </el-form-item>
            </template>

            <el-form-item label="蓝牙开关" prop="blu">
              <el-switch v-model="wifiForm.ble.mode" active-text="打开" inactive-text="关闭" :active-value="2" :inactive-value="0"/>
            </el-form-item>
            <el-form-item label="蓝牙名称" prop="ble.server.name">
              <el-input v-model="wifiForm.ble.server.name" placeholder="蓝牙名称" maxlength="50" show-word-limit :disabled="!editable"/>
            </el-form-item>
          </el-form>
          <el-row>
            <el-col :span="12">
              <el-button type="success" @click="submitWrConfig(1)">保&nbsp;&nbsp;存</el-button>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="蜂窝网络配置" name="cellular">
          <el-form ref="cellularConfigRef" :model="cellularForm" :rules="rules" label-width="100px" label-position="left">
            <el-form-item label="天线" prop="ant">
              <el-radio-group v-model="cellularForm.modem.ant">
                <el-radio-button :label="0">内置</el-radio-button>
                <el-radio-button :label="1">外置</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="⼯作模式" prop="blu">
              <el-switch v-model="cellularForm.modem.dual_sim.enabled" active-text="双SIM" inactive-text="单SIM" :active-value="true" :inactive-value="false"/>
            </el-form-item>
            <el-form-item label="主卡" prop="blu">
              <el-radio-group v-model="cellularForm.modem.dual_sim.main_sim">
                <el-radio-button label="sim1">内置SIM1</el-radio-button>
                <el-radio-button label="sim2">内置SIM2</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="extsim" prop="blu">
              <el-switch v-model="cellularForm.modem.dual_sim.extsim" active-text="开" inactive-text="关" :active-value="true" :inactive-value="false"/>
            </el-form-item>
          </el-form>
          <el-row>
            <el-col :span="12">
              <el-button type="success" @click="submitWrConfig(2)">保&nbsp;&nbsp;存</el-button>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="系统配置" name="system" v-if="$auth.hasPermi('seismograph:equipment:wrConfig:system')">
          <el-row>
            <el-col :span="24">
              <el-input
                  v-model="importJson"
                  :rows="15"
                  type="textarea"
                  placeholder="请输入配置，JSON格式`"
              />
            </el-col>
          </el-row>
          <el-row class="mt10" justify="space-between">
            <el-col :span="24">
              <el-button type="primary" icon="Upload" @click="importWrConfig()">导入配置</el-button>
            </el-col>
            <el-col :span="24" v-if="false">
              <el-button type="success" text @click="exportWrConfig()">导出配置</el-button>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-text class="mx-1" type="success">当前设备号：{{ equipment.equipmentIdentity }}</el-text>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Equipment">
import {getCurrentInstance, reactive, ref} from 'vue'
import {listEnterprise} from "@/api/seismograph/enterprise";
import {
  addEquipment,
  batchAddEquipment,
  delEquipment,
  getEquipment,
  getWrConfig,
  listEquipment,
  send5gConfigCmd,
  updateEquipment
} from "@/api/seismograph/equipment";
import useUserStore from "@/store/modules/user";

const {proxy} = getCurrentInstance();
const {document_type, sys_yes_no, device_work_mode, device_id_tpl} = proxy.useDict('document_type', 'sys_yes_no', 'device_work_mode', 'device_id_tpl');

const userStore = useUserStore()

const enterpriseList = ref([]);
const equipmentList = ref([]);
const showConfig = ref(false);
const open = ref(false);
const open1 = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const tabName = ref("wifi");
const equipment = ref({});
const importJson = ref('');
const deviceStatus = ref({});

const editable = computed(() => !userStore.enterprise?.enterpriseId)

const data = reactive({
  form: {},
  batchAddForm: {},
  wrConfig: {wlanble: {}, cellular: {}},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    equipmentIdentity: null,
    enterpriseId: null,
    siteNo: null,
    siteName: null,
    deployer: null,
    siteLoc: null,
    online: null,
    have5g: null,
    workMode: null,
  },
  rules: {
    equipmentIdentity: [
      {required: true, message: "设备编号不能为空", trigger: "blur"},
      {max: 30, message: "设备编号不能超过30个字符", trigger: "blur"},
      {min: 10, message: "设备编号不能少于10个字符", trigger: "blur"}
    ],
    enterpriseId: [
      {required: true, message: "请选择所属企业", trigger: "change"}
    ],
    have5g: [
      {required: true, message: "请选择是否带有5G", trigger: "change"}
    ],
    packetTime: [
      {required: true, message: "请选择封包间隔时间", trigger: "change"}
    ],
    workMode: [
      {required: true, message: "请选择工作模式", trigger: "change"}
    ],
    idTpl: [
      {required: true, message: "请选设备编号模板", trigger: "change"}
    ],
    start: {type: "integer", min: 0, max: 999998, message: "0 - 999998之间", required: true, trigger: "blur"},
    end: {type: "integer", min: 1, max: 999999, message: "1 - 999999之间", required: true, trigger: "blur"}
  },
  wrRules: {
    wifi: {
      ap: {
        ssid: [
          {required: true, message: "请输入SSID", trigger: "blur"},
          {max: 64, message: "SSID不能超过64个字符", trigger: "blur"},
        ],
        key: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {max: 64, message: "密码不能超过64个字符", trigger: "blur"},
          {min: 8, message: "密码不能少于8个字符", trigger: "blur"}
        ],
        auth: [
          {required: true, message: "请选择加密方式", trigger: "change"}
        ],
      },
      sta: {
        ssid: [
          {required: true, message: "请输入SSID", trigger: "blur"},
          {max: 64, message: "SSID不能超过64个字符", trigger: "blur"},
        ],
        key: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {max: 64, message: "密码不能超过64个字符", trigger: "blur"},
          {min: 8, message: "密码不能少于8个字符", trigger: "blur"}
        ]
      },
      center: {
        address: [
          {required: true, message: "请输入节点地址", trigger: "blur"},
          {max: 20, message: "节点地址不能超过20个字符", trigger: "blur"},
          {min: 7, message: "节点地址不能少于7个字符", trigger: "blur"}
        ],
        protocol: [
          {required: true, message: "请选设备编号模板", trigger: "change"}
        ],
        port: {type: "integer", min: 0, max: 65535, message: "端口范围0 - 65535", required: true, trigger: "blur"},
        keepalive: {type: "integer", min: 1, max: 999999, message: "⼼跳时间范围1 - 7200", required: true, trigger: "blur"}
      }
    },
    ble: {
      server: {
        name: [
          {required: true, message: "请输入蓝牙名称", trigger: "blur"},
          {max: 50, message: "蓝牙名称不能超过50个字符", trigger: "blur"},
          {min: 2, message: "蓝牙名称不能少于2个字符", trigger: "blur"}
        ]
      }
    }
  }
});

const {queryParams, form, rules, batchAddForm, wrConfig, wrRules} = toRefs(data);
const wifiForm = computed(() => wrConfig.value.wlanble || {});
const cellularForm = computed(() => wrConfig.value.cellular || {});

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listEquipment(queryParams.value).then(response => {
    equipmentList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
  if (!(userStore.enterprise?.enterpriseId)) {
    listEnterprise({pageNum: 1, pageSize: 1000}).then(response => {
      enterpriseList.value = response.rows;
    });
  }
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    equipmentId: null,
    equipmentIdentity: null,
    enterpriseId: null,
    firstUseTime: null,
    online: 'N',
    have5g: 'Y',
    packetTime: 5,
    accumulativeUseTime: null,
    siteNo: null,
    siteName: null,
    deployer: null,
    siteLoc: null,
    siteLocLon: null,
    siteLocLat: null,
    siteImageUri: null,
    siteVideoUri: null,
    remark: null,
    workMode: 'continuous',
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("equipmentRef");
}

function resetBatchAddForm() {
  batchAddForm.value = {
    idTpl: null,
    enterpriseId: null,
    have5g: 'Y',
    packetTime: 5,
    workMode: 'continuous',
    start: null,
    end: null,
  };
  proxy.resetForm("batchAddRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.equipmentId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加设备";
}

function handleBatchAdd() {
  resetBatchAddForm();
  open1.value = true;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _equipmentId = row.equipmentId || ids.value
  getEquipment(_equipmentId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改设备";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["equipmentRef"].validate(valid => {
    if (valid) {
      if (form.value.equipmentId != null) {
        updateEquipment(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEquipment(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

function submitBatchForm() {
  proxy.$refs["batchAddRef"].validate(valid => {
    if (!valid) return;
    if (batchAddForm.value.start >= batchAddForm.value.end) return proxy.$modal.msgError("编号范围有误：结束位置必须大于起始位置");
    batchAddEquipment(batchAddForm.value).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess(response.msg || "新增成功");
      } else {
        proxy.$modal.msgError(response.msg || "网络异常，请稍后再试");
      }
      open1.value = false;
      getList();
    });
  });
}

function submitWrConfig(type) {
  const formRef = {
    1: 'wifiConfigRef',
    2: 'cellularConfigRef',
  }
  proxy.$refs[formRef[type]].validate(valid => {
    if (!valid) return;
    send5gConfigCmd(type, equipment.value.equipmentId || 0, wrConfig.value).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess(response.msg || "提交成功");
      } else {
        proxy.$modal.msgError(response.msg || "网络异常，请稍后再试");
      }
    });
  });
}

function importWrConfig() {
  if (!importJson.value) return proxy.$modal.msgError("请输入配置参数");
  try {
    const data = JSON.parse(importJson.value);
    if (!data || typeof data !== "object") return proxy.$modal.msgError("参数格式错误");
    send5gConfigCmd(3, equipment.value.equipmentId || 0, data).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess(response.msg || "提交成功");
      } else {
        proxy.$modal.msgError(response.msg || "网络异常，请稍后再试");
      }
    });
  } catch (e) {
    proxy.$modal.msgError("参数格式错误，请检查");
  }
}

function exportWrConfig1() {
  if (!importJson.value) return proxy.$modal.msgError("设备未上传配置");
  exportFile(importJson.value, `device-config-${equipment.value.equipmentIdentity}.json`)
}

function exportFile(data, fileName) {
  // 声明blob对象
  const streamData = new Blob([data], {type: 'application/octet-stream'});
  // ie || edge 浏览器
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // msSaveOrOpenBlob => 提供保存和打开按钮
    // msSaveBlob => 只提供一个保存按钮
    window.navigator.msSaveOrOpenBlob(streamData, fileName);
  } else {
    // 创建隐藏的可下载链接
    const link = document.createElement('a');
    // 下载文件名称
    link.download = fileName;
    // link.style.visibility = 'hidden';
    link.style.display = 'none';
    // 字符内容转变为blob地址
    link.href = window.URL.createObjectURL(streamData);
    // 触发点击
    document.body.appendChild(link);
    link.click();
    // 移除
    document.body.removeChild(link);
  }
}

function exportWrConfig() {
  send5gConfigCmd(4, equipment.value.equipmentId || 0, {}).then(response => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess(response.msg || "提交成功");
    } else {
      proxy.$modal.msgError(response.msg || "网络异常，请稍后再试");
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _equipmentIds = row.equipmentId || ids.value;
  proxy.$modal.confirm('是否确认删除设备编号为"' + _equipmentIds + '"的数据项？').then(function () {
    return delEquipment(_equipmentIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('seismograph/equipment/export', {
    ...queryParams.value
  }, `equipment_${new Date().getTime()}.xlsx`)
}

function handleConfig(row) {
  equipment.value = row;
  proxy.$modal.loading("正在加载设备数据，请稍候！");
  getWrConfig(equipment.value.equipmentId || 0).then(response => {
    deviceStatus.value = response.deviceStatus || {
      "stats": {
        "model": "",
        "serial_number": "",
        "firmware_version": ""
      },
      "Cellular": {
        "link_mode": 0,
        "siglevel": 0,
        "operator": "",
        "iccid": "",
        "modem": ""
      }
    }
    if (Object.keys(response.data).length > 0) {
      // importJson.value = JSON.stringify(response.data, null, 2)
      resetConfigForm(response.data);
    } else {
      proxy.$modal.msgError("设备未上报配置");
      resetConfigForm();
    }
    tabName.value = "status"
    showConfig.value = true;
  }).finally(proxy.$modal.closeLoading);
}

function resetConfigForm(config = null) {
  wrConfig.value = Object.assign({
    "wlanble": {
      "ant": 0,
      "wifi": {
        "mode": 0,
        "ap": {
          "ssid": "",
          "key": "",
          "auth": "OPEN"
        },
        "sta": {
          "ssid": "",
          "key": ""
        },
        "center": {
          "address": "127.0.0.1",
          "port": 8000,
          "protocol": "TCP",
          "keepalive": 30
        }
      },
      "ble": {
        "mode": 2,
        "server": {
          "name": ""
        }
      }
    },
    "cellular": {
      "modem": {
        "ant": 0,
        "dual_sim": {
          "enabled": false,
          "main_sim": "sim1",
          "extsim": false
        }
      }
    }
  }, config || {});
  proxy.resetForm("wifiConfigRef");
  proxy.resetForm("cellularConfigRef");
}

getList();
</script>
<style lang="scss">
.wr-config {

  .el-dialog__body {
    padding: 0 var(--el-dialog-padding-primary);
  }

  .dialog-footer {
    text-align: left;
  }
}
</style>
