<template>
  <div>
	  <input type="range" v-model="volume" min="0" max="1.5" step="0.1" list="volume-tickmarks">
	  <datalist id="volume-tickmarks">
		  <option value="0" label="0%"/>
		  <option value="0.1"/>
		  <option value="0.2"/>
		  <option value="0.3"/>
		  <option value="0.4"/>
		  <option value="0.5" label="50%"/>
		  <option value="0.6"/>
		  <option value="0.7"/>
		  <option value="0.8"/>
		  <option value="0.9"/>
		  <option value="1.0" label="100%"/>
		  <option value="1.1"/>
		  <option value="1.2"/>
		  <option value="1.3"/>
		  <option value="1.4"/>
		  <option value="1.5" label="150%"/>
	</datalist>
	<span>{{volume}}</span>
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
				this.$store.commit('changeVolume', value)
			}
		}
	}
}
</script>

<style scoped>

</style>
