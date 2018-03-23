<template>
	<ul>
		<li v-for="track in tracks" v-on:click="play(track.position)">
			{{ track.title }} - {{ track.artists }} 
		</li>
	</ul>
</template>

<script>
import Player from "../api/player.js"

export default {
	props:['tracks'],
	methods:{
		play: function(position){
			Player.jumpTo( position )
		}
	}
}
</script>

<style scoped>

</style>
