<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编号" prop="equipmentIdentity">
        <el-input
            v-model="queryParams.equipmentIdentity"
            placeholder="请输入设备编号"
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
      <el-form-item label="站点号" prop="siteNo">
        <el-input
            v-model="queryParams.siteNo"
            placeholder="请输入站点号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名" prop="siteName">
        <el-input
            v-model="queryParams.siteName"
            placeholder="请输入站点名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="布设人" prop="deployer">
        <el-input
            v-model="queryParams.deployer"
            placeholder="请输入布设人"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点地址" prop="siteLoc">
        <el-input
            v-model="queryParams.siteLoc"
            placeholder="请输入站点地址"
            clearable
            @keyup.enter="handleQuery"
        />
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="equipmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--      <el-table-column label="ID" align="center" prop="equipmentId" max-width="100"/>-->
      <el-table-column label="设备编号" align="center" prop="equipmentIdentity"/>
      <el-table-column v-if="!userStore.enterprise.enterpriseId" label="所属企业" align="center" prop="enterpriseName" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ scope.row.enterpriseName || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="第一次使用" align="center" prop="firstUseTime" width="180">
      </el-table-column>
      <el-table-column label="使用时长" align="center" prop="accumulativeUseTime"/>
      <!--      <el-table-column label="站点号" align="center" prop="siteNo"/>-->
      <!--      <el-table-column label="站点名" align="center" prop="siteName"/>-->
      <el-table-column label="布设人" align="center" prop="deployer"/>
      <el-table-column label="在线" align="center" prop="online" width="80">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.online"/>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="160">
        <template #default="scope">
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
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="equipmentRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="设备编号" prop="equipmentIdentity">
          <el-input v-model="form.equipmentIdentity" placeholder="请输入设备编号"/>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="form.enterpriseId" placeholder="请选择企业">
            <el-option
                v-for="dict in document_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="第一次使用" prop="firstUseTime">
          <el-date-picker clearable
                          v-model="form.firstUseTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择第一次使用">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="使用时长" prop="accumulativeUseTime">
          <el-input v-model="form.accumulativeUseTime" placeholder="请输入使用时长"/>
        </el-form-item>
        <el-form-item label="站点号" prop="siteNo">
          <el-input v-model="form.siteNo" placeholder="请输入站点号"/>
        </el-form-item>
        <el-form-item label="站点名" prop="siteName">
          <el-input v-model="form.siteName" placeholder="请输入站点名"/>
        </el-form-item>
        <el-form-item label="布设人" prop="deployer">
          <el-input v-model="form.deployer" placeholder="请输入布设人"/>
        </el-form-item>
        <el-form-item label="站点地址" prop="siteLoc">
          <el-input v-model="form.siteLoc" placeholder="请输入站点地址"/>
        </el-form-item>
        <el-form-item label="经度" prop="siteLocLon">
          <el-input v-model="form.siteLocLon" placeholder="请输入经度"/>
        </el-form-item>
        <el-form-item label="纬度" prop="siteLocLat">
          <el-input v-model="form.siteLocLat" placeholder="请输入纬度"/>
        </el-form-item>
        <el-form-item label="站点图片" prop="siteImageUri">
          <image-upload v-model="form.siteImageUri"/>
        </el-form-item>
        <el-form-item label="站点视频" prop="siteVideoUri">
          <file-upload v-model="form.siteVideoUri"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Equipment">
import {getCurrentInstance, reactive, ref} from 'vue'
import {listEnterprise} from "@/api/seismograph/enterprise";
import {addEquipment, delEquipment, getEquipment, listEquipment, updateEquipment} from "@/api/seismograph/equipment";
import useUserStore from "@/store/modules/user";

const {proxy} = getCurrentInstance();
const {document_type, sys_yes_no} = proxy.useDict('document_type', 'sys_yes_no');

const userStore = useUserStore()

const enterpriseList = ref([]);
const equipmentList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    equipmentIdentity: null,
    enterpriseId: null,
    siteNo: null,
    siteName: null,
    deployer: null,
    siteLoc: null,
  },
  rules: {
    equipmentIdentity: [
      {required: true, message: "设备编号不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listEquipment(queryParams.value).then(response => {
    equipmentList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
  if(!(userStore.enterprise?.enterpriseId)){
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
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("equipmentRef");
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

getList();
</script>
