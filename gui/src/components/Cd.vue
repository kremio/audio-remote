<template>
  <div class="container">
  	  <!-- <p>CD in drive: {{ cdAvailable }}</p> -->
	  	  <tracks-list v-if="cdAvailable"/>
  </div>
</template>

<script>
import Cd from "../api/cd.js"

import TracksList from "./CdTracksList.vue"

export default {
	computed: {
		cdAvailable(){
			return this.$store.state.cd.available
		}
	},
	methods:{
		eject: function(){
			Cd.eject()
		}
	},
	components:{
		TracksList
	}
}
</script>

<style scoped>

	.container {
		position: relative;
		background-color: white;
	}
</style>
