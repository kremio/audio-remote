<template>
  <div>
  	  <p>CD in drive: {{ cdAvailable }}</p>
	  <button v-if="cdAvailable" v-on:click="eject" >Eject</button>
  </div>
</template>

<script>
import Cd from "../api/cd.js"

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
