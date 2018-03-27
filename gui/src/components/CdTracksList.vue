<template>
  <div>
	  <div v-if="available">
		  <img v-if='coverArt' v-bind:src='coverArt'/>
		  <h1>{{ title }}</h1>
		  <tracks-list v-bind:tracks='tracks'/>
	  </div>
	  <div v-else>
		  <p>Waiting for CD tracks data...</p>
	  </div>
  </div>
</template>

<script>
import TracksList from "./TracksList.vue"

export default {
	computed: {
		available(){
			return this.$store.state.cd.tracksList
		},
		temporary(){
			return this.$store.state.cd.tracksList.temporary
		},
		title(){
			return this.$store.state.cd.tracksList.title
		},
		tracks(){
			return this.$store.state.cd.tracksList.tracks
		},
		coverArt(){
			return this.$store.state.cd.tracksList.coverArt
		}
	},
	components: {
		TracksList
	}
}
</script>

<style scoped>

</style>
