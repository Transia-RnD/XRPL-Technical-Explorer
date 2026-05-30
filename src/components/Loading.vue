<template>
  <div>
    <div class="card mt-3 mb-1">
      <div class="card-body pb-5">
        <div class="text-center mt-3" style="color: #38bdf8;">
          <div class="fa-3x loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <div class="mt-3">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style lang="scss" scoped>
  .loading-spinner {
    text-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
  }
</style>
