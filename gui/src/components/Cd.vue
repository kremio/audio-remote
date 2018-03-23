<template>
  <div>
  	  <p>CD in drive: {{ cdAvailable }}</p>
	  <button v-if="cdAvailable" v-on:click="eject">Eject</button>
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
	},
	mounted(){
		this.$store.dispatch('cd/checkStatus')
		//Poll CD state every second
		setInterval(() => {
			if( !document.hasFocus() ){
				return
			}
			this.$store.dispatch('cd/checkStatus')
		}, 1000)
	}
}
</script>

<style scoped>

</style>
