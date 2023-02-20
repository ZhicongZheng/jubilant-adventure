<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import { api } from "@/utils/service"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import { ArticleCategoryDto, ArticleTagDto } from "@/request/generator"

const route = useRoute()

const articleIdRef = ref<number>()
const tagsData = ref<Array<ArticleTagDto>>()
const categoryData = ref<Array<ArticleCategoryDto>>()
const categoryFettenData = ref<Array<ArticleCategoryDto>>()

const article = reactive({
  title: "",
  introduction: "",
  frontCover: "",
  tags: new Array<number>(),
  category: new Array<number>(),
  contentMd: "",
  contentHtml: "",
  status: 0
})

const init = () => {
  fetchTagsData()
  fetchCategoryData()
  if (articleIdRef.value) {
    api.ArticleApi.getArticle(articleIdRef.value!).then((res) => {
      const articleDto = res.data
      article.title = articleDto.title
      article.introduction = articleDto.introduction
      article.contentMd = articleDto.contentMd
      article.contentHtml = articleDto.contentHtml
      article.status = articleDto.status
      if (articleDto.frontCover) {
        article.frontCover = articleDto.frontCover
      }
      if (articleDto.tags) {
        article.tags = articleDto.tags.map((tag) => tag.id)
      }
      if (articleDto.category) {
        const parent = articleDto.category.parent
        const arr = new Array<number>()
        arr.push(articleDto.category.id)
        //选择的就是第一级，直接把 id 放进数组里面就好了
        if (parent === -1) {
          article.category = arr
        } else {
          //选择的不是第一级
          // id -> category 的 map
          const map = new Map(categoryFettenData.value?.map((i) => [i.id, i]))
          //父节点
          let parentCategory = map.get(parent)
          //当父节点不为空并且没有到第一级的时候
          while (parentCategory && parentCategory?.parent != -1) {
            //把父节点的id放进去
            arr.push(parentCategory.id)
            parentCategory = map.get(parentCategory.parent)
          }
          if (parentCategory) {
            arr.push(parentCategory.id)
          }
          article.category = arr.reverse()
        }
      }
    })
  }
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
      categoryFettenData.value = res.data
      categoryDtos.map((dto) => {
        dto.children = categoryDtos.filter((c) => c.parent == dto.id).sort((c) => c.id)
      })
      categoryData.value = categoryDtos.filter((dto) => dto.parent == -1).sort((c) => c.id)
    })
    .catch(() => (categoryData.value = new Array<ArticleCategoryDto>()))
}

const saveArticle = (release: boolean) => {
  if (article.title === "" || article.introduction === "") {
    ElMessage.error("标题和简介不可为空")
    return
  }
  if (articleIdRef.value) {
    console.log("更新文章")
    api.ArticleApi.updateArticle({
      id: articleIdRef.value,
      title: article.title,
      introduction: article.introduction,
      frontCover: article.frontCover,
      tags: article.tags,
      category: article.category.at(article.category.length - 1),
      contentMd: article.contentMd,
      contentHtml: article.contentHtml
    }).then(() => ElMessage.success("保存成功"))
  } else {
    console.log("创建文章")
    api.ArticleApi.createArticle({
      title: article.title,
      introduction: article.introduction,
      frontCover: article.frontCover,
      tags: article.tags,
      category: article.category.at(article.category.length - 1),
      contentMd: article.contentMd,
      contentHtml: article.contentHtml
    }).then((res) => {
      articleIdRef.value = res.data
      ElMessage.success("保存成功")
    })
  }
  if (release) {
    api.ArticleApi.releaseArticle(articleIdRef.value!)
  }
}

const uploadCover = (res: string) => {
  article.frontCover = res
}

const props1 = {
  checkStrictly: true,
  label: "name",
  value: "id"
}

onMounted(() => {
  const articleId = route.params.id
  if (typeof articleId === "string") {
    articleIdRef.value = parseInt(String(parseInt(articleId)))
  }
  init()
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId && typeof newId === "string") {
      articleIdRef.value = parseInt(newId)
    }
    init()
  }
)
</script>

<template>
  <div class="app-container">
    <el-card>
      <div class="head-container">
        <div>{{ $route.meta.title }}</div>
        <div>
          <el-button type="info" class="right-column" @click="saveArticle(false)">保存草稿</el-button>
          <el-button type="danger" class="right-column" @click="saveArticle(true)">发布文章</el-button>
        </div>
      </div>
      <div class="brief-wrapper">
        <el-input class="brief-item" v-model="article.title" placeholder="请输入文章标题" />
        <el-input class="brief-item" v-model="article.introduction" placeholder="请输入文章简介" />
        <el-select class="brief-item" v-model="article.tags" multiple clearable placeholder="请选择标签">
          <el-option v-for="tag in tagsData" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
        <el-cascader
          style="margin-bottom: 1.25rem"
          v-model="article.category"
          :options="categoryData"
          :props="props1"
          clearable
          filterable
          placeholder="请选择分类"
        />
        <el-upload
          class="upload-cover brief-item"
          drag
          action="/api/v1/files/upload"
          limit="1"
          :on-success="uploadCover"
        >
          <i class="el-icon-upload" v-if="article.frontCover === ''" />
          <div class="el-upload__text" v-if="article.frontCover === ''">文章封面，图片拖到此处或<em>点击上传</em></div>
          <img v-else :src="article.frontCover" class="el-upload-image" alt="文章封面" />
        </el-upload>
      </div>
      <mavon-editor ref="md" v-model="article.contentMd" style="height: calc(100vh - 260px)" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.head-container {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-direction: row;
  justify-content: space-between;
}
.brief-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.brief-item {
  margin-bottom: 1.25rem;
}

.el-upload-image {
  width: 200px;
  height: 200px;
}
</style>
