<template>
  <p>{{ msg + '!' }}</p>
</template>

<script>
  export default {
    data(){
      return {
        msg: 'Hello from the template'
      }
    }
  }
</script>

<style scoped>
 p{
   color: blue;
 }
</style>
