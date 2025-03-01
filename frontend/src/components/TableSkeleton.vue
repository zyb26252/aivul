<template>
  <div class="table-skeleton">
    <div class="header-skeleton">
      <div class="title-skeleton"></div>
      <div class="search-skeleton"></div>
    </div>
    
    <el-skeleton :rows="8" animated>
      <template #template>
        <el-skeleton-item variant="p" style="width: 100%; height: 50px; margin: 8px 0;" />
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <el-skeleton-item variant="text" style="margin-right: 16px; width: 15%;" />
          <el-skeleton-item variant="text" style="margin-right: 16px; width: 20%;" />
          <el-skeleton-item variant="text" style="margin-right: 16px; width: 25%;" />
          <el-skeleton-item variant="text" style="margin-right: 16px; width: 15%;" />
          <el-skeleton-item variant="text" style="width: 15%;" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
// 无需额外的逻辑
</script>

<style lang="scss" scoped>
.table-skeleton {
  width: 100%;
  
  .header-skeleton {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .title-skeleton {
      width: 200px;
      height: 24px;
      background: var(--el-skeleton-color);
      border-radius: 4px;
    }
    
    .search-skeleton {
      width: 300px;
      height: 32px;
      background: var(--el-skeleton-color);
      border-radius: 4px;
    }
  }
  
  :deep(.el-skeleton) {
    --el-skeleton-circle-size: 40px;
  }
}
</style> 