<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="固件类型" prop="firmwareType">
        <el-select v-model="queryParams.firmwareType" placeholder="请选择固件类型" clearable>
          <el-option
              v-for="dict in firmware_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="版本号" prop="version">
        <el-input
            v-model="queryParams.version"
            placeholder="请输入版本号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文件Hash" prop="fileHash">
        <el-input
            v-model="queryParams.fileHash"
            placeholder="请输入文件Hash"
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
            v-hasPermi="['seismograph:firmware:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['seismograph:firmware:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['seismograph:firmware:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['seismograph:firmware:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="firmwareList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="firmwareId" width="80"/>
      <el-table-column label="固件类型" align="center" prop="firmwareType" width="100">
        <template #default="scope">
          <dict-tag :options="firmware_type" :value="scope.row.firmwareType"/>
        </template>
      </el-table-column>
      <el-table-column label="版本号" align="center" prop="version" width="120"/>
      <el-table-column label="升级包" align="center" prop="filePath" />
      <el-table-column label="文件Hash" align="center" prop="fileHash" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['seismograph:firmware:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['seismograph:firmware:remove']">删除</el-button>
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

    <!-- 添加或修改固件对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="firmwareRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="固件类型" prop="firmwareType">
          <el-select v-model="form.firmwareType" placeholder="请选择固件类型" style="width: 100%">
            <el-option
                v-for="dict in firmware_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="升级包" prop="filePath">
          <file-upload v-model="form.filePath" file-size="50" :file-type="['bin', 'lst']"/>
        </el-form-item>
        <el-form-item label="文件Hash" prop="fileHash">
          <el-input v-model="form.fileHash" placeholder="请输入文件Hash" maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" rows="3" maxlength="500" show-word-limit/>
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

<script setup name="Firmware">
import { listFirmware, getFirmware, delFirmware, addFirmware, updateFirmware } from "@/api/seismograph/firmware";

const { proxy } = getCurrentInstance();
const { firmware_type } = proxy.useDict('firmware_type');

const firmwareList = ref([]);
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
    firmwareType: null,
    version: null,
    fileHash: null,
  },
  rules: {
    firmwareType: [
      { required: true, message: "固件类型不能为空", trigger: "change" }
    ],
    version: [
      { required: true, message: "版本号不能为空", trigger: "blur" }
    ],
    filePath: [
      { required: true, message: "升级包不能为空", trigger: "blur" }
    ],
    fileHash: [
      { required: true, message: "文件Hash不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询固件列表 */
function getList() {
  loading.value = true;
  listFirmware(queryParams.value).then(response => {
    firmwareList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    firmwareId: null,
    firmwareType: 1,
    version: null,
    filePath: null,
    fileHash: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("firmwareRef");
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
  ids.value = selection.map(item => item.firmwareId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加固件";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _firmwareId = row.firmwareId || ids.value
  getFirmware(_firmwareId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改固件";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["firmwareRef"].validate(valid => {
    if (valid) {
      if (form.value.firmwareId != null) {
        updateFirmware(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFirmware(form.value).then(response => {
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
  const _firmwareIds = row.firmwareId || ids.value;
  proxy.$modal.confirm('是否确认删除固件编号为"' + _firmwareIds + '"的数据项？').then(function() {
    return delFirmware(_firmwareIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('seismograph/firmware/export', {
    ...queryParams.value
  }, `firmware_${new Date().getTime()}.xlsx`)
}

getList();
</script>
