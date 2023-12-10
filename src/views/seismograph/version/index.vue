<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="版本号" prop="no">
        <el-input
            v-model="queryParams.no"
            placeholder="请输入版本号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类别" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类别" clearable>
          <el-option
              v-for="dict in app_system"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="强制更新" prop="enforce">
        <el-select v-model="queryParams.enforce" placeholder="请选择强制更新" clearable>
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
            v-hasPermi="['seismograph:version:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['seismograph:version:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['seismograph:version:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['seismograph:version:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="versionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="versionId" width="80"/>
      <el-table-column label="版本号" align="center" prop="no" width="100"/>
      <el-table-column label="版本日志" align="center" prop="log" />
      <el-table-column label="下载地址" align="center" prop="uri" />
      <el-table-column label="类别" align="center" prop="type" width="80">
        <template #default="scope">
          <dict-tag :options="app_system" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="强制更新" align="center" prop="enforce" width="80">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.enforce"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['seismograph:version:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['seismograph:version:remove']">删除</el-button>
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

    <!-- 添加或修改APP版本信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="versionRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="版本号" prop="no">
          <el-input v-model="form.no" placeholder="请输入版本号" maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="类别" prop="type">
          <el-select v-model="form.type" placeholder="请选择类别" style="width: 100%">
            <el-option
                v-for="dict in app_system"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下载地址" prop="uri">
          <file-upload v-if="form.type === '1'" v-model="form.uri" file-size="200" :file-type="['apk']"/>
          <el-input v-else v-model="form.uri" placeholder="请输入下载地址" maxlength="200" show-word-limit/>
        </el-form-item>
        <el-form-item label="强制更新" prop="enforce">
          <el-select v-model="form.enforce" placeholder="请选择强制更新" style="width: 100%">
            <el-option
                v-for="dict in sys_yes_no"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本日志" prop="log">
          <el-input v-model="form.log" type="textarea" placeholder="请输入内容" maxlength="200" show-word-limit/>
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

<script setup name="Version">
import { listVersion, getVersion, delVersion, addVersion, updateVersion } from "@/api/seismograph/version";

const { proxy } = getCurrentInstance();
const { app_system, sys_yes_no } = proxy.useDict('app_system', 'sys_yes_no');

const versionList = ref([]);
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
    no: null,
    type: null,
    enforce: null,
  },
  rules: {
    no: [
      { required: true, message: "版本号不能为空", trigger: "blur" }
    ],
    log: [
      { required: true, message: "版本日志不能为空", trigger: "blur" }
    ],
    uri: [
      { required: true, message: "下载地址不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "类别不能为空", trigger: "change" }
    ],
    enforce: [
      { required: true, message: "强制更新不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询APP版本信息列表 */
function getList() {
  loading.value = true;
  listVersion(queryParams.value).then(response => {
    versionList.value = response.rows;
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
    versionId: null,
    no: null,
    log: null,
    uri: null,
    type: '1',
    enforce: 'Y',
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("versionRef");
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
  ids.value = selection.map(item => item.versionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加APP版本信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _versionId = row.versionId || ids.value
  getVersion(_versionId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改APP版本信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["versionRef"].validate(valid => {
    if (valid) {
      if (form.value.versionId != null) {
        updateVersion(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVersion(form.value).then(response => {
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
  const _versionIds = row.versionId || ids.value;
  proxy.$modal.confirm('是否确认删除APP版本信息编号为"' + _versionIds + '"的数据项？').then(function() {
    return delVersion(_versionIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('seismograph/version/export', {
    ...queryParams.value
  }, `version_${new Date().getTime()}.xlsx`)
}

getList();
</script>
