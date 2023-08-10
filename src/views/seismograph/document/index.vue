<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item v-if="type == 2" label="设备ID" prop="equipmentIdentity">
        <el-input
            v-model="queryParams.equipmentIdentity"
            placeholder="请输入设备ID"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-else label="设备系列" prop="equipmentSeries">
        <el-input
            v-model="queryParams.equipmentSeries"
            placeholder="请输入设备系列"
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
            v-hasPermi="permissions('add')"
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
            v-hasPermi="permissions('edit')"
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
            v-hasPermi="permissions('remove')"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="permissions('export')"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="documentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="documentMgtId" width="80"/>
      <el-table-column v-if="type == 2" label="设备ID" align="center" prop="equipmentIdentity"/>
      <el-table-column v-else label="设备系列" align="center" prop="equipmentSeries"/>
      <el-table-column label="文档" align="center" prop="documentName"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="permissions('edit')">修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="permissions('remove')">删除
          </el-button>
          <el-link v-hasPermi="permissions('download')" :href="`${scope.row.documentUri}`" :underline="false"
                   target="_blank">
            <el-button link type="primary" icon="Download">下载</el-button>
          </el-link>
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

    <!-- 添加或修改文档管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="documentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item v-show="false" label="类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入类型"/>
        </el-form-item>
        <el-form-item label="系列名称" prop="equipmentSeries">
          <el-input v-model="form.equipmentSeries" placeholder="请输入系列名称"/>
        </el-form-item>
        <el-form-item v-if="type !== 1" label="设备ID" prop="equipmentIdentity">
          <el-input v-model="form.equipmentIdentity" placeholder="请输入设备ID"/>
        </el-form-item>
        <el-form-item label="文档名称" prop="documentName">
          <el-input v-model="form.documentName" placeholder="请输入文档名称"/>
        </el-form-item>
        <el-form-item label="文档" prop="documentUri">
          <file-upload v-model="form.documentUri" file-size="200"/>
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

<script setup name="Document">
import {reactive, ref} from "vue";
import {useRoute} from "vue-router"
import {addDocument, delDocument, getDocument, listDocument, updateDocument} from "@/api/seismograph/document";

const type = {
  'Document': 1,
  'Report': 2,
  'Software': 3,
}[useRoute().name] || 1;

const typeName = {
  1: '操作手册',
  2: '质检报告',
  3: '更新设备',
}[type];

const permissions = (a) => {
  return {
    1: ['seismograph:manual:' + a],
    2: ['seismograph:report:' + a],
    3: ['seismograph:software:' + a],
  }[type];
}

const {proxy} = getCurrentInstance();
const {document_type} = proxy.useDict('document_type');

const documentList = ref([]);
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
    type: type,
    equipmentSeries: null,
    equipmentIdentity: null,
  },
  rules: {
    type: [
      {required: true, message: "类型不能为空", trigger: "change"}
    ],
    documentName: [
      {required: true, message: "请输入文档名称", trigger: "blur"}
    ],
    documentUri: [
      {required: true, message: "请上传文档", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询文档管理列表 */
function getList() {
  loading.value = true;
  listDocument(queryParams.value).then(response => {
    documentList.value = response.rows;
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
    documentMgtId: null,
    type: type.toString(),
    equipmentSeries: null,
    equipmentIdentity: null,
    documentName: null,
    documentUri: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("documentRef");
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
  ids.value = selection.map(item => item.documentMgtId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = `添加${typeName}`;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _documentMgtId = row.documentMgtId || ids.value
  getDocument(_documentMgtId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = `修改${typeName}`;
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["documentRef"].validate(valid => {
    if (valid) {
      if (form.value.documentMgtId != null) {
        updateDocument(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDocument(form.value).then(response => {
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
  const _documentMgtIds = row.documentMgtId || ids.value;
  proxy.$modal.confirm('是否确认删除文档管理编号为"' + _documentMgtIds + '"的数据项？').then(function () {
    return delDocument(_documentMgtIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('seismograph/document/export', {
    ...queryParams.value
  }, `document_${new Date().getTime()}.xlsx`)
}

getList();
</script>
