<template>
	<ul>
		<li v-for="track in tracks" v-on:click="play(track.file)" v-bind:class="{ active: isActive(track.file) }">
			{{ track.title }} - <span class="artist">{{ track.artists }}</span>
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
	ul {
		padding-top: 10px;
		list-style-type: none;
		color: rgb(234,233,245);
		padding: 0;
	  font-size: 1.2em;
	  font-family: 'Open Sans Condensed', sans-serif;
		overflow: scroll;
    height: calc(100% - 5em - 10px);
	}

	li {
		padding-left: 50px;
		margin: 5px 5px;
	}

	li:hover:not(.active) {
		cursor: pointer;
		color: rgba(0,183,234,1);
	}
	
  .active{
	  background: linear-gradient(to right, rgba(0,183,234,1) 0%,rgba(0,158,195,1) 100%);
	  color: black;
  }

  .artist {
	  font-style: italic;
  	color: rgb(168, 179, 110);
  }

  .active .artist{
		color: rgb(255,255,255);
	}
</style>
