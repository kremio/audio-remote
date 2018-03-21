<template>
  <div>
	  <input type="range" v-model="volume" min="0" max="150" step="10" list="volume-tickmarks">
	  <datalist id="volume-tickmarks">
		  <option value="0" label="0%"/>
		  <option value="10"/>
		  <option value="20"/>
		  <option value="30"/>
		  <option value="40"/>
		  <option value="50" label="50%"/>
		  <option value="60"/>
		  <option value="70"/>
		  <option value="80"/>
		  <option value="90"/>
		  <option value="100" label="100%"/>
		  <option value="110"/>
		  <option value="120"/>
		  <option value="130"/>
		  <option value="140"/>
		  <option value="105" label="150%"/>
	</datalist>
	<span>{{volume}} %</span>
  </div>
</template>

<script>
export default {
	computed: {
		volume: {
			get(){
				return this.$store.state.volume
			},
			set(value){
				this.$store.dispatch('setVolume', value)
			}
		}
	},
	mounted(){
		this.$store.dispatch('getVolume')
	}
}
</script>

<style scoped>

</style>
