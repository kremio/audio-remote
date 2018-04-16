<template>
  <div>
	  <div v-if="available" class="container" v-bind:class="{ expanded: expanded }">
		  <img v-if='coverArt' v-bind:src='coverArt'/>
		  <div class="album-info">
			  <h1>{{ title }} <button class="toggle" v-on:click="toggle">...</button></h1>
			  <album-search v-if='notFound'/>
				<tracks-list class="tracks-list" v-bind:tracks='tracks'/>
		  </div>
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
	data: ()=>({
		expanded: false
	}),
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
	methods:{
		toggle: function(){
			this.expanded = !this.expanded;
		}
	},
	components: {
		TracksList,
		AlbumSearch
	}
}
</script>

<style scoped>

	.container {
		position: relative;
		overflow: hidden;
	}

	img {
		width: 100%;
		height: auto;
		vertical-align: top;
	}

	.album-info {
		position: absolute;
		width: 100%;
		height: 100%;
		bottom: calc(2.5em + 10px - 100%);
		overflow: hidden;
		transition: bottom 1s;
    background: linear-gradient(to bottom, #000000d6 0%,#0000009c 100%);
	}

	.toggle {
		vertical-align: middle;
	}

	.toggle:hover{ cursor:n-resize; }
	
	h1 {
		color: white;
		padding: 5px;
		margin: 0;
	}
	
	.tracks-list {
		margin:0;
	}

	.expanded .album-info {
		bottom: 0;
	}

	.expanded .toggle:hover{ cursor:s-resize; }

</style>
