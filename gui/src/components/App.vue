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
  box-sizing: border-box;
	width: 100%;
  min-height: 100%;
  max-height: 100%;
  height: 100%;
	padding-top: 3em;
}
</style>
