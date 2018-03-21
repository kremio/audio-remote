<template>
  <div>
      <cd/>
	  <volume-control/>
  </div>
</template>

<script>
  import VolumeControl from "./VolumeControl.vue"
  import Cd from "./Cd.vue"
  export default {
    components: {
	    Cd,
	    VolumeControl
	}
  }
</script>

<style scoped>
 p{
   color: blue;
 }
</style>
