<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { api } from "@/utils/service"
import { usePagination } from "@/hooks/usePagination"
import { ElMessage, ElMessageBox, FormInstance } from "element-plus"
import { ArticleCategoryDto, ArticleDto, ArticleTagDto } from "@/request/generator"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tagsData = ref<Array<ArticleTagDto>>()
const categoryData = ref<Array<ArticleCategoryDto>>()
const tableData = ref<Array<ArticleDto>>()
const selectCategory = ref<number[]>([])
const selectTag = ref<number>()
const searchTitle = ref<string>()

const searchFormRef = ref<FormInstance | null>(null)

const fetchTableData = () => {
  loading.value = true

  api.ArticleApi.listArticleByPage(
    paginationData.page,
    paginationData.size,
    selectTag.value,
    selectCategory.value?.at(selectCategory.value?.length - 1),
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
    .catch(() => (tagsData.value = new Array<ArticleTagDto>()))
}

const fetchCategoryData = () => {
  api.ArticleCategoryApi.listCategories()
    .then((res) => {
      const categoryDtos = res.data
      categoryDtos.map((dto) => {
        dto.children = categoryDtos.filter((c) => c.parent == dto.id).sort((c) => c.id)
      })
      categoryData.value = categoryDtos.filter((dto) => dto.parent == -1).sort((c) => c.id)
    })
    .catch(() => (categoryData.value = new Array<ArticleCategoryDto>()))
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

const handleRelease = (article: ArticleDto) => {
  api.ArticleApi.releaseArticle(article.id).then(() => {
    ElMessage.success("发布成功")
    fetchTableData()
  })
}

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  if (paginationData.page === 1) {
    fetchTableData()
  }
  paginationData.page = 1
}

const props1 = {
  checkStrictly: true,
  label: "name",
  value: "id"
}

onMounted(() => fetchTagsData())
onMounted(() => fetchCategoryData())
/** 监听分页参数变化*/
watch([() => paginationData.page, () => paginationData.size], fetchTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true">
        <el-form-item prop="tag" label="标签">
          <el-select v-model="selectTag">
            <el-option v-for="tag in tagsData" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="category" label="分类">
          <el-cascader v-model="selectCategory" :options="categoryData" :props="props1" clearable filterable />
        </el-form-item>
        <el-form-item prop="title" label="标题">
          <el-input v-model="searchTitle" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchTableData">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
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
          <el-table-column prop="status" label="文章状态" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1">已发布</el-tag>
              <el-tag v-else-if="row.status === 0">草稿</el-tag>
              <el-tag v-else-if="row.status === -1">已删除</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleRelease(scope.row)">发布</el-button>
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

.el-select {
  width: 100%;
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}
</style>
