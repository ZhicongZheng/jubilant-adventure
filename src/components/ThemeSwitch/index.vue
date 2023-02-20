<script lang="ts" setup>
import { useTheme } from "@/hooks/useTheme"
import { ref } from "vue"

const { setTheme } = useTheme()

const theme = ref(Boolean)

const handleSetTheme2 = (block: Boolean) => {
  if (block) {
    setTheme("dark")
  } else {
    setTheme("normal")
  }
}
</script>

<template>
  <div>
    <span> 暗黑模式 </span>
    <el-switch v-model="theme" @change="handleSetTheme2" />
  </div>
</template>
