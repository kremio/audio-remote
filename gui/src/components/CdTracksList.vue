<template>
  <div>
	  <div v-if="available">
		  <img v-if='coverArt' v-bind:src='coverArt'/>
		  <h1>{{ title }}</h1>
		  <album-search v-if='notFound'/>
		  <tracks-list v-bind:tracks='tracks'/>
	  </div>
	  <div v-else>
		  <p>Waiting for CD tracks data...</p>
	  </div>
  </div>
</template>

<script>
import TracksList from "./TracksList.vue"
import AlbumSearch from "./AlbumSearch.vue"

export default {
	computed: {
		available(){
			return this.$store.state.cd.tracksList
		},
		temporary(){
			return this.$store.state.cd.tracksList.temporary
		},
		notFound(){
			return this.$store.state.cd.tracksList.notfound
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
		TracksList,
		AlbumSearch
	}
}
</script>

<style scoped>
</style>
