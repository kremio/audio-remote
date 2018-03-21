<template>
  <div>
      <cd/>
	  <volume-control/>
      <player/>
  </div>
</template>

<script>
  import VolumeControl from "./VolumeControl.vue"
  import Cd from "./Cd.vue"
  import Player from "./Player.vue"

  export default {
    components: {
	    Cd,
	    VolumeControl,
	    Player
	}
  }
</script>

<style scoped>
 p{
   color: blue;
 }
</style>
