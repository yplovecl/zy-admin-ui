<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入企业名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="企业等级" prop="enterpriseLevel">
        <el-select v-model="queryParams.enterpriseLevel" placeholder="请选择企业等级" clearable>
          <el-option
              v-for="dict in enterprise_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
              v-for="dict in sys_normal_disable"
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
            v-hasPermi="['seismograph:enterprise:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['seismograph:enterprise:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['seismograph:enterprise:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['seismograph:enterprise:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="enterpriseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="ID" align="center" prop="enterpriseId" width="80"/>-->
      <el-table-column label="企业名称" prop="name" :show-overflow-tooltip="true"/>
      <el-table-column label="联系人" prop="contactPerson" width="100"/>
      <el-table-column label="联系方式" prop="contactWay" width="120"/>
      <el-table-column label="社会信用代码" prop="uniformSocialCreditCode" />
      <el-table-column label="通讯地址" prop="mailingAddress" :show-overflow-tooltip="true"/>
      <el-table-column label="企业等级" align="center" prop="enterpriseLevel" width="80">
        <template #default="scope">
          <dict-tag :options="enterprise_level" :value="scope.row.enterpriseLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="用户数" align="center" prop="numberOfUsers" width="80"/>
      <el-table-column label="空间大小" align="center" prop="useDiskSize" width="80">
        <template #default="scope">
         <span>{{scope.row.useDiskSize}}G</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['seismograph:enterprise:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['seismograph:enterprise:remove']">删除</el-button>
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

    <!-- 添加或修改企业对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="enterpriseRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="企业简称" prop="abbreviation">
          <el-input v-model="form.abbreviation" placeholder="请输入企业简称" />
        </el-form-item>
        <el-form-item label="通讯地址" prop="mailingAddress">
          <el-input v-model="form.mailingAddress" placeholder="请输入通讯地址" />
        </el-form-item>
        <el-form-item label="社会信用代码" prop="uniformSocialCreditCode">
          <el-input v-model="form.uniformSocialCreditCode" placeholder="请输入社会信用代码" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contactWay">
          <el-input v-model="form.contactWay" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="企业等级" prop="enterpriseLevel">
          <el-select v-model="form.enterpriseLevel" placeholder="请选择企业等级">
            <el-option
                v-for="dict in enterprise_level"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户数" prop="numberOfUsers">
          <el-input-number v-model="form.numberOfUsers" :min="1" :max="1000"/>
        </el-form-item>
        <el-form-item label="空间大小" prop="useDiskSize">
<!--          <el-input v-model="form.useDiskSize" placeholder="请输入空间大小" />-->
          <el-input-number v-model="form.useDiskSize" :min="1" :max="100"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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

<script setup name="Enterprise">
import { listEnterprise, getEnterprise, delEnterprise, addEnterprise, updateEnterprise } from "@/api/seismograph/enterprise";

const { proxy } = getCurrentInstance();
const { enterprise_level, sys_normal_disable } = proxy.useDict('enterprise_level', 'sys_normal_disable');

const enterpriseList = ref([]);
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
    name: null,
    enterpriseLevel: null,
    status: null,
  },
  rules: {
    name: [
      { required: true, message: "企业名称不能为空", trigger: "blur" }
    ],
    abbreviation: [
      { required: true, message: "企业简称不能为空", trigger: "blur" }
    ],
    mailingAddress: [
      { required: true, message: "通讯地址不能为空", trigger: "blur" }
    ],
    uniformSocialCreditCode: [
      { required: true, message: "社会信用代码不能为空", trigger: "blur" }
    ],
    contactPerson: [
      { required: true, message: "联系人不能为空", trigger: "blur" }
    ],
    contactWay: [
      { required: true, message: "联系方式不能为空", trigger: "blur" }
    ],
    enterpriseLevel: [
      { required: true, message: "企业等级不能为空", trigger: "change" }
    ],
    numberOfUsers: [
      { required: true, message: "用户数不能为空", trigger: "blur" }
    ],
    useDiskSize: [
      { required: true, message: "空间大小不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询企业列表 */
function getList() {
  loading.value = true;
  listEnterprise(queryParams.value).then(response => {
    enterpriseList.value = response.rows;
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
    enterpriseId: null,
    name: null,
    abbreviation: null,
    mailingAddress: null,
    uniformSocialCreditCode: null,
    contactPerson: null,
    contactWay: null,
    enterpriseLevel: null,
    numberOfUsers: 1,
    useDiskSize: 1,
    status: '0',
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("enterpriseRef");
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
  ids.value = selection.map(item => item.enterpriseId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加企业";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _enterpriseId = row.enterpriseId || ids.value
  getEnterprise(_enterpriseId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改企业";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["enterpriseRef"].validate(valid => {
    if (valid) {
      if (form.value.enterpriseId != null) {
        updateEnterprise(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEnterprise(form.value).then(response => {
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
  const _enterpriseIds = row.enterpriseId || ids.value;
  proxy.$modal.confirm('是否确认删除企业编号为"' + _enterpriseIds + '"的数据项？').then(function() {
    return delEnterprise(_enterpriseIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('seismograph/enterprise/export', {
    ...queryParams.value
  }, `enterprise_${new Date().getTime()}.xlsx`)
}

getList();
</script>
