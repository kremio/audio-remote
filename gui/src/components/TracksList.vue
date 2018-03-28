<template>
	<ul>
		<li v-for="track in tracks" v-on:click="play(track.file)" v-bind:class="{ active: isActive(track.file) }">
			{{ track.title }} - {{ track.artists }} 
		</li>
	</ul>
</template>

<script>
import PlayList from "../api/playlist.js"

export default {
	props:['tracks'],
	methods:{
		isActive: function( file ){
			return file == this.$store.state.player.playingFile
		},
		play: function( file ){
			PlayList.playFrom( file )
		}
	}
}
</script>

<style scoped>
  .active{
	  background-color: grey;
  }
</style>
