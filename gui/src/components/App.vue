<template>
  <div class="app">
		<toolbar/>
	  <div class="main-container">
		  <cd/>
		  <player/>
	  </div>
  </div>
</template>

<script>
  import Toolbar from "./Toolbar.vue"
  import Cd from "./Cd.vue"
  import Player from "./Player.vue"

  export default {
	  components: {
		  Toolbar,
		  Cd,
		  Player
	  }
  }
</script>

<style scoped>
 .app {
	 width: 100%;
	 height: 100%;

	 padding-top: 3em;
 }
 .main-container {
   background-color: white;
 }
</style>
