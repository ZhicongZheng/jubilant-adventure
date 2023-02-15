<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { RefreshRight } from "@element-plus/icons-vue"
import { api } from "@/utils/service"
import { usePagination } from "@/hooks/usePagination"
import { ElMessage, ElMessageBox } from "element-plus"
import { ArticleDto, ArticleTag } from "@/request/generator"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tagsData = ref<Array<ArticleTag>>()
const tableData = ref<Array<ArticleDto>>()

const searchTag = ref<number>()
const searchCategory = ref<number>()
const searchTitle = ref<string>()
const fetchTableData = () => {
  loading.value = true
  api.ArticleApi.listArticleByPage(
    paginationData.page,
    paginationData.size,
    searchTag.value,
    searchCategory.value,
    searchTitle.value
  )
    .then((res) => {
      tableData.value = res.data.data
      paginationData.totalCount = res.data.totalCount
    })
    .catch(() => (tableData.value = new Array<ArticleDto>()))
    .finally(() => (loading.value = false))
}

const fetchTagsData = () => {
  api.ArticleTagApi.listTags()
    .then((res) => (tagsData.value = res.data))
    .catch(() => (tagsData.value = new Array<ArticleTag>()))
}

const handleRefresh = () => fetchTableData()

const handleDelete = (article: ArticleDto) => {
  ElMessageBox.confirm(`确定删除文章: ${article.title}?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    api.ArticleApi.deleteArticle(article.id).then(() => {
      ElMessage.success("删除成功")
      fetchTableData()
    })
  })
}

onMounted(() => fetchTagsData())
/** 监听分页参数变化*/
watch([() => paginationData.page, () => paginationData.size], fetchTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" header-cell-class-name="table-header">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="id" label="id" align="center" />
          <el-table-column prop="title" label="文章标题" align="center" />
          <el-table-column prop="introduction" label="文章介绍" align="center" />
          <el-table-column prop="frontCover" label="文章封面" align="center" />
          <el-table-column prop="status" label="文章状态" align="center" />
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <!--              <el-button type="primary" text bg size="small" @click="openUpdateDialog(scope.row)">发布</el-button>-->
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.totalCount"
          :page-size="paginationData.size"
          :currentPage="paginationData.page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.table-wrapper {
  margin-bottom: 20px;
  :deep(.table-header) {
    background-color: var(--el-fill-color-light) !important;
  }
}

.el-tag {
  margin-right: 10px;
  margin-bottom: 20px;
}

.el-select {
  width: 100%;
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
